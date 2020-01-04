const x2js = new X2JS();
var json = [];

const search = async (text) => {
  let info = json.urlset.url.map(e => { return { title: e.title, loc: e.loc } });
  for (let i = 0; i < info.length; i++) {
    info[i].title = englishDownCase(info[i].title);
  }
  let textDownCase = englishDownCase(text);
  const filtered = info.filter(e => {
    return e.title.indexOf(textDownCase) > -1
  });
  return filtered;
}

const englishDownCase = (text) => {
  let res = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      res.push(String.fromCharCode(code + 32));
    } else {
      res.push(text[i]);
    }
  }
  return res.join("");
}

$(window).on('load', async function () {
  const xml = await fetch("/sitemap.xml");
  const xmlText = await xml.text();
  json = await x2js.xml_str2json(xmlText);
});

$(document).ready(function () {
  $("#searchbox").on("keyup", async function () {
    $("#searchresult").empty();
    const text = $(this).val();
    if (text.length >= 2) {
      const res = await search(text);
      res.map(e => {
        $("#searchresult").append(`<li class="resultli"><a href="${e.loc}">${e.title}</a></li>`)
      })
    }
  })
})