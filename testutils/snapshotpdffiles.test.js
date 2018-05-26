const debug = require('debug')('app:testutils/snapshotpdffiles.test.js');
const { resolve } = require('app-root-path');
const snapshotPdfFiles = require('./snapshotpdffiles');

const testbed = resolve('testutils/__testbed__/snapshotpdffiles');

describe('The test utility function snapshotPdfFiles', () => {
  it('should return an empty array from a folder without pdf files', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(testbed).catch(e => debug(e));
    expect(folderSnapshot).toHaveLength(0);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshotPdfFiles a folder with a single pdf file into an array with one element', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(`${testbed}/onepdffile`).catch(e => debug(e));
    expect(folderSnapshot).toHaveLength(1);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should snapshotPdfFiles a folder with multiple pdf files into an array', async () => {
    expect.assertions(2);
    const folderSnapshot = await snapshotPdfFiles(`${testbed}/manypdffiles`)
      .catch(e => debug(e));
    debug('snapshotPdfFiles - ', new Error());
    expect(folderSnapshot).toHaveLength(3);
    expect(folderSnapshot).toMatchSnapshot();
  });
});
