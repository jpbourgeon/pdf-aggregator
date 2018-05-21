const fs = require('fs-extra');
const resolvePath = require('app-root-path').resolve;
const snapshotPdfFiles = require('./__testutils__/snapshotpdffiles');
const PdfAggregator = require('./pdfaggregator');

const testbed = resolvePath('main/utils/__testbed__').replace(/\\/g, '/');

const defaultOptions = {
  input: `${testbed}/pdfaggregator/input`,
  level: 0,
  depth: -1,
  output: `${testbed}/pdfaggregator/output`,
  filename: '%dossiersource%_%dateiso%',
  cover: true,
  logo: `${testbed}/pdfaggregator/logo/image.jpg`,
  title: '%dossiersource%',
  subtitle: 'Version : %date%%ligne%Auteur : jpbourgeon',
  changelog: true,
  bookmarks: true,
};

describe('PDF Aggregator', () => {
  describe('the async crawlFolder function', () => {
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

  describe('the async getFoldersToAggregate function', () => {
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

    it('should match the snapshot of the folders at level 1', async () => {
      expect.assertions(1);
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: 1 })
        .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
      expect(foldersToAggregate).toMatchSnapshot();
    });

    it(
      'should match the snapshot of the folders at the tree\'s max depth, if the level provided is greater than it',
      async () => {
        expect.assertions(1);
        const tree = await PdfAggregator.crawlFolder(defaultOptions.input);
        const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: Infinity })
          .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
        expect(foldersToAggregate).toMatchSnapshot();
      },
    );
  });

  describe('the getSubTree function', () => {
    it('should throw an error if the tree is empty', () => {
      expect(() => {
        PdfAggregator.getSubTree([{ fullPath: '/file/path', depth: 5 }], '/another/path/');
      }).toThrowError('There is no file to aggregate');
    });

    it('should match the snapshot of the subtree with an unlimited depth', () => {
      const files = PdfAggregator.getSubTree([
        { fullPath: '', depth: 0 },
        { fullPath: 'file1.pdf', depth: 0 },
        { fullPath: '/file/', depth: 1 },
        { fullPath: '/file/path/', depth: 2 },
        { fullPath: '/file/path/file1.pdf', depth: 3 },
        { fullPath: '/file/path/folder1', depth: 3 },
        { fullPath: '/file/path/folder1/file1.pdf', depth: 4 },
        { fullPath: '/file/another/path', depth: 3 },
        { fullPath: '/file/another/path/file1.pdf', depth: 4 },
      ], '/file/path/');
      expect(files).toMatchSnapshot();
    });

    it('should match the snapshot of the subtree with a limited depth', () => {
      const files = PdfAggregator.getSubTree([
        { fullPath: '', depth: 0 },
        { fullPath: 'file1.pdf', depth: 0 },
        { fullPath: '/file/', depth: 1 },
        { fullPath: '/file/path/', depth: 2 },
        { fullPath: '/file/path/file1.pdf', depth: 3 },
        { fullPath: '/file/path/folder1', depth: 3 },
        { fullPath: '/file/path/folder1/file1.pdf', depth: 4 },
        { fullPath: '/file/another/path', depth: 3 },
        { fullPath: '/file/another/path/file1.pdf', depth: 4 },
      ], '/file/path/', 3);
      expect(files).toMatchSnapshot();
    });

    describe('the async deduplicatePdfPath function', () => {
      let nextIteration;
      let expectedLoops;

      const setupPathExistsMock = (count) => {
        nextIteration = 0;
        expectedLoops = count;
      };

      const mockPathExists = () => new Promise((resolve) => {
        const currentIteration = nextIteration;
        nextIteration += 1;
        if (currentIteration >= expectedLoops) {
          resolve(false);
        } else {
          resolve(true);
        }
      });

      it('should return path.pdf if the file doesn\'t exists', async () => {
        setupPathExistsMock(0);
        expect.assertions(1);
        const result = await PdfAggregator.deduplicatePdfPath('path.pdf', mockPathExists);
        expect(result).toBe('path.pdf');
      });

      it('should return path_1.pdf if path.pdf already exists', async () => {
        setupPathExistsMock(1);
        expect.assertions(1);
        const result = await PdfAggregator.deduplicatePdfPath('path.pdf', mockPathExists);
        expect(result).toBe('path_1.pdf');
      });

      it('should return path_3.pdf if the 3 previous files already exist', async () => {
        setupPathExistsMock(3);
        expect.assertions(1);
        const result = await PdfAggregator.deduplicatePdfPath('path.pdf', mockPathExists);
        expect(result).toBe('path_3.pdf');
      });
    });
  });

  describe('the stripEmptyFolders function', () => {
    it('should match the snapshot of the cleaned subtree', () => {
      const result = PdfAggregator.stripEmptyFolders([
        { fullPath: '', type: 'directory' },
        { fullPath: 'file1.pdf', type: 'file' },
        { fullPath: '/file/', type: 'directory' },
        { fullPath: '/file/file1.pdf', type: 'file' },
        { fullPath: '/file/path/', type: 'directory' },
        { fullPath: '/file/path/folder1', type: 'directory' },
        { fullPath: '/file/path/folder1/file1.pdf', type: 'file' },
        { fullPath: '/file/path/folder2', type: 'directory' },
        { fullPath: '/file/another/path', type: 'directory' },
      ]);
      expect(result).toMatchSnapshot();
    });
    it('should work on empty folders', () => {
      const result = PdfAggregator.stripEmptyFolders([]);
      expect(result).toMatchSnapshot();
    });
  });

  describe('Tests that write to the output folder', () => {
    const outputFolder = `${testbed}/pdfaggregator/output`;

    beforeEach(async (done) => {
      // discard the output folder's content
      await fs.emptyDir(`${testbed}/pdfaggregator/output`);
      done();
    });

    afterAll(async (done) => {
      // discard the output folder's content
      await fs.emptyDir(`${testbed}/pdfaggregator/output`);
      done();
    });

    describe('the async makeEmptyPdf function', () => {
      it('should make an empty pdf document to use as a template', async () => {
        expect.assertions(1);
        await PdfAggregator.makeEmptyPdf(outputFolder);
        const result = await snapshotPdfFiles(outputFolder);
        expect(result).toMatchSnapshot();
      });
    });

    describe('the async aggregate function', () => {
      describe('on an empty folder', () => {
        it.only('should match an empty snapshot', async () => {
          await PdfAggregator.aggregate(
            {
              ...defaultOptions,
              input: `${defaultOptions.input}/Empty_folder`,
            },
            jest.fn(),
          );
          const result = await snapshotPdfFiles(outputFolder);
          expect(result).toMatchSnapshot();
        });
      });

      describe('on the root folder with unlimited depth', () => {
        it('should match the snapshot, with the following config: cover page, change log, outline');

        it('should match the snapshot, with the following config: no cover page, no change log, no outline');
      });

      describe('on level 1 folders with depth 1', () => {
        it('should match the snapshot, with the following config: cover page, change log, outline');

        it('should match the snapshot, with the following config: no cover page, no change log, no outline');
      });

      describe('on level 1 folders with unlimited depth', () => {
        it('should match the snapshot, with the following config: cover page, change log, outline');

        it('should match the snapshot, with the following config: no cover page, no change log, no outline');
      });
    });
  });
});

describe('todo', () => {
  it('should send localized messages (i18n)');
});
