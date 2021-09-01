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

const byIds = async (branch, ids) => {
  const filePath = path.resolve(__dirname, "exports", `manual-${branch}.csv`);
  const csvFile = new CsvFile({
    path: filePath,
    headers: [...Object.keys(detailsSelectors), "GelbeSeiten ID"],
  });

  try {
    const dataPromises = ids.map(async (id) => {
      return new Promise((res) => {
        setTimeout(async () => {
          const html = await fetchDetails({
            url: "https://www.gelbeseiten.de/gsbiz/" + id,
          });
          res({ ...extractDetails(html), "GelbeSeiten ID": id });
        }, getDelayBetween(50, 100));
      });
    });

    const data = await Promise.all(dataPromises);

    if (data.length > 0) {
      await csvFile.append(data);
    }
    console.log("COMPLETE");
  } catch (error) {
    console.error(error);
  }
};

const main = async (args) => {
  let bar;
  const filePath = path.resolve(__dirname, "exports", getFileName(args));
  const csvFile = new CsvFile({
    path: filePath,
    headers: [...Object.keys(detailsSelectors), "GelbeSeiten ID"],
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

const frauenhausIds = [
  "176768a6-2b9d-4f77-8846-17278e4a1697",
  "ea249c0f-3fb1-4491-a653-32281308e72a",
  "4751e40a-5e87-40f1-8b78-05978d09b768",
  "90fbe125-2ee7-4ebc-bbb0-a2b7182f47d0",
  "a7cd8086-2333-4e0c-8fe3-44a0e7768799",
  "587bb403-bfe9-4156-8f90-54b49f3675d6",
  "5fb48453-bfaf-4ff6-86ec-781bd5b215f1",
  "69beea87-24a0-477f-8923-6fe0417f536a",
  "85d67485-61ea-4eaf-8d6e-dbc96f7325c6",
  "f2512618-0e26-46bb-be69-cba0a00d51fd",
  "aa39be7e-8542-4c09-a058-880109bccf71",
  "1d18922c-5584-49ca-b048-86f360d93033",
  "d3ff8778-9b7a-476c-b1db-3f5c9d1c67ea",
  "542e1fb7-068e-47aa-b4d2-103ffb9e2625",
  "c1a56a3f-3008-44ae-86fe-6c3d67153460",
  "a74d5e9c-5038-439a-92c3-78394919cd0a",
  "639d7200-0d14-4a71-9ff4-5c67bb6c3619",
  "eda0372a-b003-411a-8d2d-99ec28ef25cc",
  "8ac46a63-d8ac-46b8-94f4-6dbada332846",
  "cb5fd1fd-23da-4ad6-8cbb-58de7c81b379",
  "25009b6b-348b-4859-9a93-854b8365312e",
  "248d0fcf-def4-4491-bb09-1f471131973f",
  "c190ff22-2b78-435a-8db5-55e1327e1067",
  "cf1db626-07d2-41a8-98d4-022b1ad967b8",
  "8097cf31-6a41-4430-96b3-8dd792bc1949",
  "60ed46c4-2023-4693-8c43-ce752ea0bdaa",
  "69533a6b-7162-499d-9352-d4413f43d07c",
  "bbeb7901-53f5-426d-9866-b2a43a8c23d6",
  "bbeb7901-53f5-426d-9866-b2a43a8c23d6",
  "408b56e8-885c-4cf9-a824-14a69a098949",
  "faf8ca08-01a5-44db-9fce-386973cad5b6",
  "eb2c65c3-d10b-4b56-ad4d-c0a464329a4a",
  "dd0ea567-a53b-4dc5-8f73-d445c00af71e",
  "9d4d3fb8-8ccc-4d79-a9be-bf8598ea5848",
  "203c9bd5-a7f6-4f7b-a67e-0471718ef150",
  "9fe6ab4a-977d-4a38-b972-a15f04449788",
  "665b6cb6-eceb-4c18-9d6f-258ee8274129",
  "29ea6caf-98dc-4c16-8f65-7272c5f34629",
  "a63b6ab5-d7b6-4043-8818-cf8848031bf5",
  "7af7f7cd-6c9d-443e-8aa7-31d1a9fbef6b",
  "656f8a07-a159-4b2d-a20b-795ffb64543a",
  "f9758f36-daec-4ce8-9e13-0cc8a4a02673",
  "a9ebeabd-84cc-41f8-99b7-e87fb2136e35",
  "03296ca1-28cd-46a8-89e1-1a9dd6e4b489",
  "d69465c1-c40f-43cf-a3cc-810e56e78b27",
  "d3d77bdd-ec1b-4803-8aec-44c377c78580",
  "bd5906fb-bc5d-4358-a10b-eb9665712509",
  "f5bc98d4-795c-40e5-8e88-3f91659caa58",
  "f8aa324a-8f2f-4f17-8dc3-8a4fd5bd5e4f",
  "d89fddf5-d9ff-43be-87c4-888144abf6a6",
  "1eeb5ee3-9539-44c9-9863-67990c39779d",
  "eeb1f164-102b-4cb1-a2cc-2d46e4585a1c",
  "2be7c471-36ee-4af1-93a1-ce7e28c74062",
  "f731420c-a001-4799-9924-31756bfeca7e",
  "f731420c-a001-4799-9924-31756bfeca7e",
];

// byIds("Frauenhäuser", frauenhausIds);
// main({ branch: "Frauenhaus", zip: "Magdeburg", radius: "50000" });
main({ branch: "Frauenhaus", zip: "Freiburg", radius: "50000" });
