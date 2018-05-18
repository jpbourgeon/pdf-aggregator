const { resolve } = require('app-root-path');
const snapshotPdfFiles = require('./snapshotpdffiles');

const testbed = resolve('main/utils/__testbed__/snapshotpdffiles');

describe('The test utility function snapshotPdfFiles', () => {
  it('should return an empty array from a folder without pdf files', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(testbed)
      .catch(e => console.log(e)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(0);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshot a folder with a single pdf file into an array with one element', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(`${testbed}/onepdffile`)
      .catch(e => console.log(e)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(1);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshot a folder with multiple pdf files into an array', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(`${testbed}/manypdffiles`)
      .catch(e => console.log(e)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(3);
    expect(folderSnapshot).toMatchSnapshot();
  });
});
