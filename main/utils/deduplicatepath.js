const debug = require('debug')('app:utils/deduplicatepath.js');
const fs = require('fs-extra');

const deduplicatePath = async (filename, extension, pathExists = fs.pathExists) => {
  const basename = filename.substring(0, filename.length - extension.length);
  let i = 0;
  while (await pathExists(`${basename}${(i > 0) ? `_${i}` : ''}${extension}`) // eslint-disable-line no-await-in-loop
    .catch((e) => {
      debug(e);
      return false;
    })
  ) i += 1;
  const result = `${basename}${(i > 0) ? `_${i}` : ''}${extension}`;
  return result;
};

module.exports = {
  deduplicatePath,
};
