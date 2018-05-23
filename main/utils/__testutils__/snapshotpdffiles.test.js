const { resolve } = require('app-root-path');
const { encode, hash } = require('./snapshotpdffiles');

const testbed = resolve('main/utils/__testbed__/snapshotpdffiles');

describe('The test utility function encode', () => {
  it('should return an empty array from a folder without pdf files', async () => {
    expect.assertions(2);
    const folderSnapshot = await encode(testbed)
      .catch(e => console.log(`snapshotPdfFiles > encode test 1: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(0);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should encode a folder with a single pdf file into an array with one element', async () => {
    expect.assertions(2);
    const folderSnapshot = await encode(`${testbed}/onepdffile`)
      .catch(e => console.log(`snapshotPdfFiles > encode test 2: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(1);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should encode a folder with multiple pdf files into an array', async () => {
    expect.assertions(2);
    const folderSnapshot = await encode(`${testbed}/manypdffiles`)
      .catch(e => console.log(`snapshotPdfFiles > encode test 3: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(3);
    expect(folderSnapshot).toMatchSnapshot();
  });
});

describe('The test utility function hash', () => {
  it('should return an empty array from a folder without pdf files', async () => {
    expect.assertions(2);
    const folderSnapshot = await hash(testbed)
      .catch(e => console.log(`snapshotPdfFiles > hash test 1: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(0);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should hash a folder with a single pdf file into an array with one element', async () => {
    expect.assertions(2);
    const folderSnapshot = await hash(`${testbed}/onepdffile`)
      .catch(e => console.log(`snapshotPdfFiles > hash test 2: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(1);
    expect(folderSnapshot).toMatchSnapshot();
  });

  it('should hash a folder with multiple pdf files into an array', async () => {
    expect.assertions(2);
    const folderSnapshot = await hash(`${testbed}/manypdffiles`)
      .catch(e => console.log(`snapshotPdfFiles > hash test 3: ${e.message}`)); // eslint-disable-line no-console
    expect(folderSnapshot).toHaveLength(3);
    expect(folderSnapshot).toMatchSnapshot();
  });
});
