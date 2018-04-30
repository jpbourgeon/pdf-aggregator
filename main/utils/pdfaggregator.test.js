const fs = require('fs-extra-promise');
const { resolve } = require('app-root-path');
// const snapshotPdfFiles = require('./__testutils__/snapshotpdffiles');
const PdfAggregator = require('./pdfaggregator');

const testbed = resolve('main/utils/__testbed__').replace(/\\/g, '/');

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
    it('should return a valid snapshot', async () => {
      expect.assertions(1);
      let tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      tree = tree.map(element => ({
        ...element,
        fullPath: `[MOCKED_OS_SPECIFIC_PATH]${element.fullPath.split('__testbed__')[1]}`,
        lastModified: 'MOCKED_DATE',
      }), []);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('the getFoldersToAggregate function', () => {
    it('should return an empty folder if the tree is empty', () => {
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate([], defaultOptions);
      expect(foldersToAggregate).toEqual([]);
    });

    it('should return the input folder\'s path for level 0', async () => {
      expect.assertions(1);
      const expectedValue = [defaultOptions.input.split('__testbed__')[1]];
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, defaultOptions)
        .map(element => element.split('__testbed__')[1], []);
      expect(foldersToAggregate).toEqual(expectedValue);
    });

    it('should return a valid snapshot for level 2', async () => {
      expect.assertions(1);
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: 2 })
        .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
      expect(foldersToAggregate).toMatchSnapshot();
    });
  });

  it('should be localized (i18n ?)');
});

// const options = {
//   ...defaultOptions,
//   output: `${defaultOptions.output}/folder_of_the_test`,
// };
