const { resolve } = require('app-root-path');
const snapshotPdfFiles = require('./snapshotpdffiles');

const testbed = resolve('main/utils/__testbed__/snapshotpdffiles');

describe('The test utility function snapshotPdfFiles', () => {
  it('should return an empty array from a folder without pdf files', async () => {
    try {
      expect.assertions(2);
      const folderSnapshot = await snapshotPdfFiles(testbed);
      expect(folderSnapshot).toHaveLength(0);
      expect(folderSnapshot).toMatchSnapshot();
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.log(error);
    }
  });

  it('should snapshot a folder with a single pdf file into an array with one element', async () => {
    try {
      expect.assertions(2);
      const folderSnapshot = await snapshotPdfFiles(`${testbed}/onepdffile`);
      expect(folderSnapshot).toHaveLength(1);
      expect(folderSnapshot).toMatchSnapshot();
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.log(error);
    }
    expect.assertions(2);
  });

  it('should snapshot a folder with multiple pdf files into an array', async () => {
    try {
      expect.assertions(2);
      const folderSnapshot = await snapshotPdfFiles(`${testbed}/manypdffiles`);
      expect(folderSnapshot).toHaveLength(3);
      expect(folderSnapshot).toMatchSnapshot();
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.log(error);
    }
    expect.assertions(2);
  });
});
