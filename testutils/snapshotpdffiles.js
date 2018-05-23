const fs = require('fs-extra');
const crypto = require('crypto');

const snapshotPdfFiles = async (folder) => {
  let pdfFiles = await fs.readdir(folder)
    .catch(e => console.log(`snapshotPdfFiles > hash fs.readdir: ${e.message}`)); // eslint-disable-line no-console
  pdfFiles = pdfFiles.filter(element => (element.substr(-4) === '.pdf'));

  const promises = pdfFiles.map(async (pdf) => {
    let content = await fs.readFile(`${folder}/${pdf}`)
      .catch(e => console.log(`snapshotPdfFiles > hash fs.readFile: ${e.message}`)); // eslint-disable-line no-console
    // Selection of the hashing algorithm:  https://medium.com/@chris_72272/what-is-the-fastest-node-js-hashing-algorithm-c15c1a0e164e
    content = content
      .toString('utf-8')
      .replace(/(\/ID \[)(.*)(\])/, '$1ID$3')
      .replace(/(\/Producer \()(.*)(\))/, '$1PRODUCER$3')
      .replace(/(\/CreationDate \()(.*)(\))/, '$1DATE$3');
    console.log(content);
    return crypto.createHash('sha1').update(content).digest('base64');
  });

  const snapshot = await Promise.all(promises)
    .catch(e => console.log(`snapshotPdfFiles > hash Promise.all: ${e.message}`)); // eslint-disable-line no-console

  return snapshot.sort();
};

module.exports = snapshotPdfFiles;

