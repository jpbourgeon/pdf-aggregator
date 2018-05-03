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
  depth: '',
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
    it('should throw an error if the tree is empty', () => {
      expect(() => {
        PdfAggregator.getFoldersToAggregate([], defaultOptions);
      }).toThrowError('There is no folder to aggregate');
    });

    it('should return the input folder\'s path for level 0', async () => {
      expect.assertions(1);
      const expectedValue = [defaultOptions.input.split('__testbed__')[1]];
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, defaultOptions)
        .map(element => element.split('__testbed__')[1], []);
      expect(foldersToAggregate).toEqual(expectedValue);
    });

    it('should match the snapshot for level 2', async () => {
      expect.assertions(1);
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: 2 })
        .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
      expect(foldersToAggregate).toMatchSnapshot();
    });

    it(
      'should match the snapshot of the tree\'s max depth, if the level provided is greater than it',
      async () => {
        expect.assertions(1);
        const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
        const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: 99 })
          .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
        expect(foldersToAggregate).toMatchSnapshot();
      },
    );
  });

  describe('the getSubTree function', () => {
    it('should throw an error if the tree is empty', () => {
      expect(() => {
        PdfAggregator.getSubTree([{ fullPath: '/file/path' }], '/another/path/');
      }).toThrowError('There is no file to aggregate');
    });

    it('should return a tree of pdf files otherwise', () => {
      const files = PdfAggregator.getSubTree([
        { fullPath: '' },
        { fullPath: 'file1.pdf' },
        { fullPath: '/file/' },
        { fullPath: '/file/path/' },
        { fullPath: '/file/path/file1.pdf' },
        { fullPath: '/file/path/folder1' },
        { fullPath: '/file/path/folder1/file1/pdf' },
        { fullPath: '/file/another/path' },
        { fullPath: '/file/another/path/file1.pdf' },
      ], '/file/path/');
      expect(files).toMatchSnapshot();
    });
  });

  describe('the aggregate function', () => {
    it('should work', () => {
      PdfAggregator.aggregate({ ...defaultOptions, level: 0 }, jest.fn());
    });

    describe('on an empty folder', () => {
      it('should throw an error with the following config: cover page, change log, outline');

      it('should throw an error with the following config: no cover page, no change log, no outline');
    });

    describe('on the root folder with unlimited depth', () => {
      it('should match the snapshot with the following config: cover page, change log, outline');

      it('should match the snapshot with the following config: no cover page, no change log, no outline');
    });

    describe('on level 1 folders with depth 1', () => {
      it('should match the snapshot with the following config: cover page, change log, outline');

      it('should match the snapshot with the following config: no cover page, no change log, no outline');
    });

    describe('on level 2 folders with depth 99', () => {
      it('should match the snapshot with the following config: cover page, change log, outline');

      it('should match the snapshot with the following config: no cover page, no change log, no outline');
    });

    it('should send localized messages (i18n)');
  });
});
