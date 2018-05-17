const fs = require('fs-extra');

const snapshotPdfFiles = (folder) => {
  const pdfFiles = fs.readdirSync(folder).filter(element => (element.substr(-4) === '.pdf'));
  const result = [];
  for (let i = 0; i < pdfFiles.length; i += 1) {
    result.push(Buffer
      .from(fs.readFileSync(`${folder}/${pdfFiles[i]}`), { encoding: 'binary' })
      .toString('base64'));
  }
  return result;
};


module.exports = snapshotPdfFiles;
