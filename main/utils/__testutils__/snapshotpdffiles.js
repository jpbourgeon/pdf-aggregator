const fs = require('fs-extra');

const snapshotPdfFiles = async (folder) => {
  try {
    let pdfFiles = await fs.readdir(folder)
      .catch(e => console.log(e)); // eslint-disable-line no-console
    pdfFiles = pdfFiles.filter(element => (element.substr(-4) === '.pdf'));
    const promises = pdfFiles.map(async (pdf) => {
      let content = await fs.readFile(`${folder}/${pdf}`)
        .catch(e => console.log(e)); // eslint-disable-line no-console
      content = content
        .toString()
        .replace(/(\/CreationDate \(D:)(.*)(\))/, '$1MOCKED_DATE$3');
      return Buffer
        .from(content, { encoding: 'binary' })
        .toString('base64');
    });
    const snapshot = await Promise.all(promises)
      .catch(e => console.log(e)); // eslint-disable-line no-console
    return snapshot.sort();
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    return false;
  }
};

module.exports = snapshotPdfFiles;
