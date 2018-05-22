const fs = require('fs-extra');

const snapshotPdfFiles = async (folder) => {
  let pdfFiles = await fs.readdir(folder)
    .catch(e => console.log(`snapshotPdfFiles > fs.readdir: ${e.message}`)); // eslint-disable-line no-console
  pdfFiles = pdfFiles.filter(element => (element.substr(-4) === '.pdf'));

  const promises = pdfFiles.map(async (pdf) => {
    let content = await fs.readFile(`${folder}/${pdf}`)
      .catch(e => console.log(`snapshotPdfFiles > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
    content = content
      .toString()
      .replace(/(\/Producer \()(.*)(\))/, '$1MOCKED_PRODUCER$3')
      .replace(/(\/CreationDate \(D:)(.*)(\))/, '$1MOCKED_DATE$3')
      .replace(/(\/ID \[)(.*)(\])/, '$1MOCKED_ID$3');
    return Buffer
      .from(content, { encoding: 'binary' })
      .toString('base64');
  });

  const snapshot = await Promise.all(promises)
    .catch(e => console.log(`snapshotPdfFiles > Promise.all: ${e.message}`)); // eslint-disable-line no-console

  return snapshot.sort();
};

module.exports = snapshotPdfFiles;
