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
  if (entry.stat.isFile()) type = 'file';
  if (entry.stat.isDirectory()) type = 'directory';
  if (entry.stat.isBlockDevice()) type = 'blockDevice';
  if (entry.stat.isCharacterDevice()) type = 'characterDevice';
  if (entry.stat.isSymbolicLink()) type = 'symbolicLink';
  if (entry.stat.isFIFO()) type = 'FIFO';
  if (entry.stat.isSocket()) type = 'socket';
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
    arr.sort((a, b) => {
      if (a.fullPath < b.fullPath) return -1;
      if (a.fullPath > b.fullPath) return 1;
      return 0;
    });
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
