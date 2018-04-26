const { resolve } = require('app-root-path');
const snapshotPdfFiles = require('./snapshotpdffiles');

const testbed = resolve('main/utils/__testbed__/snapshotpdffiles');

describe('The test utility function snapshotPdfFiles', () => {
  it('should return an empty array from a folder without pdf files', () => {
    const folderSnapshot = snapshotPdfFiles(testbed);
    expect(folderSnapshot).toHaveLength(0);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshot a folder with a single pdf file into an array with one element', () => {
    const folderSnapshot = snapshotPdfFiles(`${testbed}/onepdffile`);
    expect(folderSnapshot).toHaveLength(1);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshot a folder with multiple pdf files into an array', () => {
    const folderSnapshot = snapshotPdfFiles(`${testbed}/manypdffiles`);
    expect(folderSnapshot).toHaveLength(3);
    expect(folderSnapshot).toMatchSnapshot();
  });
});
