/* eslint-disable no-await-in-loop */
const {
  detailsSelectors,
  extractEntries,
  extractDetails,
} = require("./extractors/gelbeseiten");
const fs = require("fs");
const path = require("path");
const { fetchDetails, fetchSearch } = require("./fetchers/gelbeseiten");
const CsvFile = require("./CsvFile");
const Progress = require("progress");

const getDelayBetween = (from, to) =>
  Math.floor(Math.random() * (to - from)) + from;

const getFileName = ({ zip, branch, radius }) =>
  `${zip}-${branch}-${radius}.csv`;

const initProgressBar = (totalResults) =>
  new Progress(
    "  :elapseds searching.. [:bar] :percent :current/:total :etas",
    {
      complete: "=",
      incomplete: " ",
      width: 20,
      total: totalResults,
    }
  );

const crawl = async (nextPosition, { branch, zip, radius }) => {
  const body = await fetchSearch({
    branch,
    zip,
    radius,
    position: nextPosition,
  });

  const {
    gesamtanzahlTreffer: totalResults,
    anzahlTreffer: resultsCount,
    html,
  } = body;

  if (resultsCount === 0) {
    return { data: [], totalResults };
  }

  const ids = extractEntries(html);
  const data = ids.map(async (id) => {
    return new Promise((res) => {
      setTimeout(async () => {
        const html = await fetchDetails({
          url: "https://www.gelbeseiten.de/gsbiz/" + id,
        });
        res({ realid: id, ...extractDetails(html) });
      }, getDelayBetween(50, 100));
    });
  });

  return { data, totalResults };
};

const main = async (args) => {
  let bar;
  const filePath = path.resolve(__dirname, "exports", getFileName(args));
  const csvFile = new CsvFile({
    path: filePath,
    headers: ["realid", ...Object.keys(detailsSelectors)],
  });

  const rowsCount = await csvFile.count();
  let iterator = rowsCount + 1;

  (async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const { data: dataPromises, totalResults } = await crawl(
          iterator,
          args
        );
        const data = await Promise.all(dataPromises);
        bar = bar || initProgressBar(totalResults);

        if (data.length > 0) {
          await csvFile.append(data);

          bar.tick(data.length);
          iterator += data.length;
        } else {
          console.log("  COMPLETE");
          break;
        }
      } catch (error) {
        console.error(error);
        break;
      }
    }
  })();
};

main({ branch: "hotel", zip: "64823", radius: "50000" });
