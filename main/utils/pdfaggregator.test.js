const fs = require('fs-extra-promise');
const { resolve } = require('app-root-path');
// const snapshotPdfFiles = require('./__testutils__/snapshotpdffiles');
const PdfAggregator = require('./pdfaggregator');

const testbed = resolve('main/utils/__testbed__/');

const defaultOptions = {
  input: `${testbed}/pdfaggregator/input`,
  output: `${testbed}/pdfaggregator/output`,
  logo: `${testbed}/pdfaggregator/logo/image.jpg`,
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%',
  subtitle: 'Version : %date%%ligne%Auteur : jpbourgeon',
  level: 0,
  changelog: true,
  bookmarks: true,
};

beforeAll(() => {
  // discard the output folder's content
  fs.emptyDirSync(`${testbed}/pdfaggregator/output`);
});

describe('PDF Aggregator', () => {
  describe('the crawlFolder function', () => {
    it('should return a valid tree', async () => {
      expect.assertions(1);
      let tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      tree = tree.map(element => ({
        ...element,
        fullPath: `[...]${element.fullPath.split('__testbed__')[1]}`,
        lastModified: 'MOCKED_DATE',
      }), []);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('the getFoldersToAggregate function', () => {
    it('should return a valid tree');
  });

  it('should be localized (i18n ?)');
});

// const options = {
//   ...defaultOptions,
//   output: `${defaultOptions.output}/folder_of_the_test`,
// };
