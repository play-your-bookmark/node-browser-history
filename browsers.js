const Path = require("path");
const fs = require("fs");
const { setupDefaultPaths: setupPaths } = require("./history_paths");

const CHROME = "Google Chrome";

const browserDbLocations = {
  chrome: "",
};

const defaultPaths = {
  chrome: "",
};

setupPaths(defaultPaths);

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} startPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @param targetFile
 * @param depth
 * @return {Array}               Result files with path string in an array
 */
function findFilesInDir(startPath, filter, targetFile, depth = 0) {
  if (depth === 4) {
    return [];
  }

  let results = [];

  if (!fs.existsSync(startPath)) {
    return results;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = Path.join(startPath, files[i]);

    if (!fs.existsSync(filename)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter, targetFile, depth + 1));
    } else if (filename.endsWith(targetFile) === true) {
      results.push(filename);
    }
  }

  return results;
}

/**
 * Finds the path to the browsers DB file.
 * Returns an array of strings, paths, or an empty array
 * @param path
 * @param browserName
 * @returns {Array}
 */
function findPaths(path, browserName) {
  switch (browserName) {
    case CHROME:
      return findFilesInDir(path, "History", `${Path.sep}History`);
    default:
      return [];
  }
}

module.exports = {
  findPaths,
  browserDbLocations,
  defaultPaths,
  CHROME,
};
