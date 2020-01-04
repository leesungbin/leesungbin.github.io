const x2js = new X2JS();
var json = [];

const search = async (text) => {
  // console.log(json.urlset.url);
  let titles = json.urlset.url.map(e => { return e.title });

  for (let i = 0; i < titles.length; i++) {
    titles[i] = englishDownCase(titles[i]);
  }
  let textDownCase = englishDownCase(text);
  const filtered = titles.filter(e => {
    return e.indexOf(textDownCase) > -1
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
  // console.log(json);
});