const request = require("request");
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36";

exports.fetchSearch = ({ branch, zip, radius, position }) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: "https://www.gelbeseiten.de/AjaxSuche",
        method: "POST",
        headers: {
          "user-agent": userAgent,
          "content-type": "multipart/form-data",
          accept: "*/*",
          origin: "https://www.gelbeseiten.de",
        },
        // proxy: PROXYS[0],
        timeout: 10000,
        tunnel: false,
        followRedirect: true,
        maxRedirects: 10,
        verbose: true,
        formData: {
          WAS: branch,
          WO: zip,
          umkreis: radius,
          position: position,
        },
      },
      (err, response, body) => {
        try {
          if (err) throw err;
          resolve(JSON.parse(body));
        } catch (error) {
          functions.logger.log("fetchSearch Error:", error);
          reject(error);
        }
      }
    );
  });
};

exports.fetchDetails = ({ url }) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: url,
        method: "GET",
        headers: {
          "user-agent": userAgent,
          origin: "https://www.gelbeseiten.de",
        },
        // proxy: PROXYS[0],
        timeout: 10000,
        tunnel: false,
        followRedirect: true,
        maxRedirects: 10,
        verbose: true,
      },
      (err, response, body) => {
        try {
          if (err) throw err;
          resolve(body);
        } catch (error) {
          console.error("fetchDetails Error:", error);
          reject(error);
        }
      }
    );
  });
};
