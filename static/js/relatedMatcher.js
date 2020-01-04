$(document).ready(async function () {
  for (let i = 0; i < 20; i++) {
    if (json.length === 0) {
      await watcher(() => { }, 1000);
    } else {
      break;
    }
  }

  const data = json.urlset.url;

  const postTitle = $(".post-title").text();
  const postIdx = data.findIndex(e => e.title === postTitle);
  const postCategories = data[postIdx].categories.category;

  let relatedNumWithIdx = [];
  for (let i = 0; i < data.length; i++) {
    if (i === postIdx) {
      relatedNumWithIdx.push([-100, i]);
      continue;
    }
    let val = 0;
    for (let j = 0; j < postCategories.length; j++) {
      if (data[i].categories.category.includes(postCategories[j])) val++;
    }
    relatedNumWithIdx.push([val, i]);
  }

  relatedNumWithIdx.sort((a, b) => {
    if (b[0] - a[0] === 0) { // 일치하는 tag 갯수가 같다면,
      try {
        // 맨 뒤에 붙는 포스트의 번호를 가지고 정렬하기
        const postV = parseInt(postTitle.split(' ').slice(-1)[0]);
        const postaV = parseInt(data[a[1]].title.split(' ').slice(-1)[0]);
        const postbV = parseInt(data[b[1]].title.split(' ').slice(-1)[0]);
        return Math.abs(postV - postaV) - Math.abs(postV - postbV)
      } catch (err) {
        // 오류가 났을 경우, 그저 비교
        return data[a[1]].title - data[b[1]].title
      }
    }
    return b[0] - a[0];
  });

  for (let i = 0; i < 5; i++) {
    if (relatedNumWithIdx[i][0] === 0) {
      break;
    }
    const post = data[relatedNumWithIdx[i][1]];
    $("#related-posts").append(`<li>
      <a href="${post.loc}">
        ${post.title}
        <small><time datetime="${post.lastmod}">${formatDate(post.lastmod)}</time></small>
      </a>
    </li>`);
  }
  // console.log(relatedNumWithIdx, postTitle, postIdx, postCategories);
});

function watcher(handler, ms) {
  return new Promise(resolve => setTimeout(() => { handler(); resolve(); }, ms));
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ' ' + year;
}