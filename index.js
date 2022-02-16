const path = require("path");
const fs = require("fs");
const Database = require("sqlite-async");
const uuidV4 = require("uuid").v4;

const { tmpdir } = require("os");
const browsers = require("./browsers");

/**
 * Get the path to the temp directory of
 * the current platform.
 */
function getTempDir() {
  return process.env.TMP || process.env.TMPDIR || tmpdir();
}

/**
 * Runs the the proper function for the given browser. Some browsers follow the same standards as
 * chrome and firefox others have their own syntax.
 * Returns an empty array or an array of browser record objects
 * @param paths
 * @param browserName
 * @param historyTimeLength
 * @returns {Promise<array>}
 */
async function getBrowserHistory(paths = [], browserName, historyTimeLength, date) {
  switch (browserName) {
    case browsers.CHROME:
      return await getChromeBasedBrowserRecords(paths, browserName, historyTimeLength, date);
    default:
      return [];
  }
}

async function getHistoryFromDb(newDbPath, sql, browserName) {
  const db = await Database.open(newDbPath);
  const rows = await db.all(sql);
  const browserHistory = rows.map((row) => {
    return {
      title: row.title,
      utc_time: row.last_visit_time,
      url: row.url,
      browser: browserName,
    };
  });

  await db.close();

  return browserHistory.sort((a, b) => new Date(b.utc_time) - new Date(a.utc_time));
}

function deleteTempFiles(paths) {
  paths.forEach((path) => {
    fs.unlinkSync(path);
  });
}

async function getChromeBasedBrowserRecords(paths, browserName, historyTimeLength, date) {
  if (!paths || paths.length === 0) {
    return [];
  }
  const newDbPaths = [];
  const browserHistory = [];
  for (let i = 0; i < paths.length; i++) {
    const newDbPath = path.join(getTempDir(), `${uuidV4()}.sqlite`);
    newDbPaths.push(newDbPath);
    const sql = `SELECT title, datetime(last_visit_time/1000000 + (strftime('%s', '1601-01-01')),'unixepoch') last_visit_time, url from urls WHERE DATETIME (last_visit_time/1000000 + (strftime('%s', '1601-01-01')), 'unixepoch')  >= DATETIME('${date}', '-${historyTimeLength} minutes') AND DATETIME(last_visit_time/1000000 + (strftime('%s', '1601-01-01')), 'unixepoch') < DATETIME('${date}') group by title, last_visit_time order by last_visit_time`;

    // Assuming the sqlite file is locked so lets make a copy of it
    fs.copyFileSync(paths[i], newDbPath);
    browserHistory.push(await getHistoryFromDb(newDbPath, sql, browserName));
  }
  deleteTempFiles(newDbPaths);

  return browserHistory;
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getChromeHistory(historyTimeLength = 5, date) {
  browsers.browserDbLocations.chrome = browsers.findPaths(
    browsers.defaultPaths.chrome,
    browsers.CHROME,
  );

  return getBrowserHistory(
    browsers.browserDbLocations.chrome,
    browsers.CHROME,
    historyTimeLength,
    date,
  ).then((records) => {
    return records;
  });
}

module.exports = {
  getChromeHistory,
};
