const cheerio = require("cheerio");

exports.extractEntries = (html) => {
  const $ = cheerio.load(html);

  const entries = $("[data-realid]").get() || [];
  return entries.map((el) => cheerio(el).data("realid"));
};

exports.detailsSelectors = detailsSelectors = {
  name: "h1.mod-TeilnehmerKopf__name",
  "address.street": ".mod-TeilnehmerKopf__adresse-daten:nth-child(1)",
  "address.zip": ".mod-TeilnehmerKopf__adresse-daten:nth-child(2)",
  "address.city": ".mod-TeilnehmerKopf__adresse-daten--noborder",
  phone: ".mod-TeilnehmerKopf__telefonnummer>span",
  website: ".mod-Kontaktdaten__list-item.contains-icon-homepage>a",
  email: ".mod-Kontaktdaten__list-item>a[property=email]>span",
  branch: ".mod-BranchenUndStichworte:first-of-type",
  tags: ".mod-BranchenUndStichworte:last-of-type",
};
exports.extractDetails = (html) => {
  const $ = cheerio.load(html);

  const data = {};

  for (const key in detailsSelectors) {
    const selector = detailsSelectors[key];

    data[key] = $(selector).text().trim();
  }
  data.tags = data.tags.replace(/\s/g, "");

  return data;
};
