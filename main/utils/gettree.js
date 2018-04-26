const readdirp = require('readdirp');

const onData = (entry, arr) => {
  const parentDir = entry.parentDir.replace(/\\/g, '/');
  const fullPath = entry.fullPath.replace(/\\/g, '/');
  let depth;
  if (parentDir === '') {
    depth = 1;
  } else {
    depth = parentDir.split('/').length + 1;
  }
  let type;
  if (entry.stat.isFile()) type = 'File';
  if (entry.stat.isDirectory()) type = 'Directory';
  if (entry.stat.isBlockDevice()) type = 'BlockDevice';
  if (entry.stat.isCharacterDevice()) type = 'CharacterDevice';
  if (entry.stat.isSymbolicLink()) type = 'SymbolicLink';
  if (entry.stat.isFIFO()) type = 'FIFO';
  if (entry.stat.isSocket()) type = 'Socket';
  arr.push({
    depth,
    fullPath,
    lastModified: entry.stat.mtime,
    name: entry.name,
    parentDir,
    type,
  });
};

const onEnd = (err, arr, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve(arr);
  }
};

const getTree = options => new Promise((resolve, reject) => {
  const arr = [];
  readdirp(options)
    .on('data', entry => onData(entry, arr))
    .on('warn', err => onEnd(err, arr, resolve, reject))
    .on('error', err => onEnd(err, arr, resolve, reject))
    .on('end', err => onEnd(err, arr, resolve, reject))
    .on('close', err => onEnd(err, arr, resolve, reject));
});

module.exports = {
  getTree,
  onData,
  onEnd,
};
