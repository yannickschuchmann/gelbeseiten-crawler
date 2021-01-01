const path = require("path");
const fs = require("fs");
const csv = require("@fast-csv/format");
const { parse } = require("@fast-csv/parse");
const { runInThisContext } = require("vm");

class CsvFile {
  static write(filestream, rows, options) {
    return new Promise((res, rej) => {
      csv
        .writeToStream(filestream, rows, options)
        .on("error", (err) => rej(err))
        .on("finish", () => res());
    });
  }

  constructor(opts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
  }

  create(rows) {
    return CsvFile.write(fs.createWriteStream(this.path), rows, {
      ...this.writeOpts,
    });
  }

  append(rows) {
    return fs.existsSync(this.path)
      ? CsvFile.write(fs.createWriteStream(this.path, { flags: "a" }), rows, {
          ...this.writeOpts,
          // dont write the headers when appending
          writeHeaders: false,
        })
      : this.create(rows);
  }

  count() {
    return new Promise((res, rej) => {
      const stream = fs.createReadStream(this.path);
      stream
        .on("error", (_) => res(0))
        .pipe(parse({ headers: true }))
        .on("error", (error) => {
          throw error;
        })
        .on("data", (_) => {})
        .on("end", (rowCount) => {
          res(rowCount);
        });
    });
  }
}

module.exports = CsvFile;
