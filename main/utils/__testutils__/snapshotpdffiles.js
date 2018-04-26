const fs = require('fs-extra');
const { resolve } = require('app-root-path');

const snapshotPdfFiles = (folder) => {
  const pdfFiles = fs.readdirSync(folder).filter(element => (element.substr(-4) === '.pdf'));
  const result = [];
  pdfFiles.forEach((value) => {
    result.push(Buffer
      .from(fs.readFileSync(`${folder}/${value}`), { encoding: 'binary' })
      .toString('base64'));
  });
  return result;
};


module.exports = snapshotPdfFiles;
