const fs = require('fs-extra');

const snapshotPdfFiles = async (folder) => {
  try {
    let pdfFiles = await fs.readdir(folder);
    pdfFiles = pdfFiles.filter(element => (element.substr(-4) === '.pdf'));
    const promises = pdfFiles.map(async (pdf) => {
      const content = await fs.readFile(`${folder}/${pdf}`);
      return Buffer
        .from(content, { encoding: 'binary' })
        .toString('base64');
    });
    const snapshot = await Promise.all(promises);
    return snapshot.sort();
  } catch (error) {
  /* eslint-disable-next-line no-console */
    console.log(error);
    return false;
  }
};

module.exports = snapshotPdfFiles;
