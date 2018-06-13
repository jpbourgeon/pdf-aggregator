const debug = require('debug')('app:utils/savejson.js');
const fs = require('fs-extra');
const { deduplicatePath } = require('./deduplicatepath.js');

const saveJson = async (file, data) => {
  const path = await deduplicatePath(file, '.json').catch(e => debug(e));
  await fs.outputJson(path, data).catch(e => debug(e));
};

module.exports = {
  saveJson,
};
