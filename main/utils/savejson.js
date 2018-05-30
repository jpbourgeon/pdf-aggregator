const debug = require('debug')('app:utils/savejson.js');
const fs = require('fs-extra');

const deduplicateJsonPath = async (path, pathExistsDI = fs.pathExists) => {
  const file = path.substring(0, path.length - 5);
  let i = 0;
  while (await pathExistsDI(`${file}${(i > 0) ? `_${i}` : ''}.json`) // eslint-disable-line no-await-in-loop
    .catch((e) => {
      debug(e);
      return false;
    })
  ) i += 1;
  const result = `${file}${(i > 0) ? `_${i}` : ''}.json`;
  return result;
};

const saveJson = async (file, data) => {
  const path = await deduplicateJsonPath(file).catch(e => debug(e));
  await fs.outputJson(path, data).catch(e => debug(e));
};

module.exports = {
  saveJson,
  deduplicateJsonPath,
};
