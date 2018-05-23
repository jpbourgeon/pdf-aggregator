const fs = require('fs-extra');
const resolvePath = require('app-root-path').resolve;
const snapshotPdfFiles = require('./__testutils__/snapshotpdffiles').hash;
const PdfAggregator = require('./pdfaggregator');

jest.setTimeout(10000); // Give some slack to the filesystem operations

const testbed = resolvePath('main/utils/__testbed__').replace(/\\/g, '/');

const defaultOptions = {
  input: `${testbed}/pdfaggregator/input`,
  level: 0,
  depth: 0,
  output: `${testbed}/pdfaggregator/output`,
  filename: 'testFile',
  cover: false,
  logo: `${testbed}/pdfaggregator/logo/image.jpg`,
  title: '%dossiersource%',
  subtitle: 'Version : %dateiso%%ligne%Auteur : jpbourgeon',
  changelog: false,
  documentOutline: false,
  toc: false,
  pageNumbers: false,
};

const outputFolders = [
  'changelog',
  'cover01',
  'cover02',
  'makeEmptyPdf',
  'merge01',
  'merge02',
  'merge03',
  'merge04',
  'outline',
  'pageNumbers',
  'toc',
];

const resetOutputFolders = async () => {
  // discard the output folders content
  try {
    const promises = [];
    for (let i = 0; i < outputFolders.length; i += 1) {
      promises.push(fs.emptyDir(`${defaultOptions.output}/${outputFolders[i]}`));
    }
  } catch (e) {
    console.log(`fs.emptyDir: ${e.message}`); // eslint-disable-line no-console
  }
};

beforeAll(async (done) => {
  await resetOutputFolders()
    .catch(e => console.log(`beforeAll resetOutputFolders: ${e.message}`)); // eslint-disable-line no-console
  done();
});

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

  describe('the fillPlaceholders function', () => {
    it('should not modify an input with unknown placeholders', () => {
      const input = 'an input with %unknown% %placeholders%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, 'MOCKED_DATE');
      expect(result).toBe('an input with %unknown% %placeholders%');
    });

    it('should replace %dossiersource% or %inputfolder% by the input folder\'s name', () => {
      const input = '%dossiersource%|%inputfolder%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, 'MOCKED_DATE');
      expect(result).toBe('input|input');
    });

    it('should replace %dateiso% or %isodate% by the ISO date', () => {
      const input = '%dateiso%|%isodate%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, 'MOCKED_DATE');
      expect(result).toBe('MOCKED_DATE|MOCKED_DATE');
    });

    it('should replace %ligne% or %line% by \\n', () => {
      const input = 'ligne 1%ligne%ligne 2%line%ligne 3';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, 'MOCKED_DATE');
      expect(result).toBe('ligne 1\nligne 2\nligne 3');
    });
  });

  describe('Tests that write to the output folder', () => {
    describe('the async makeEmptyPdf function', () => {
      it('should make an empty pdf document to use as a template', async () => {
        const output = `${defaultOptions.output}/makeEmptyPdf`;
        expect.assertions(1);
        await PdfAggregator.makeEmptyPdf(output);
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });
    });

    describe('the async aggregate function', () => {
      it('should match an empty snapshot on an empty folder', async () => {
        const output = `${defaultOptions.output}/merge01`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            input: `${defaultOptions.input}/Empty_folder`,
            output,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot on the root folder with unlimited depth', async () => {
        const output = `${defaultOptions.output}/merge02`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot on level 1 folders with unlimited depth', async () => {
        const output = `${defaultOptions.output}/merge03`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            level: 1,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot on level 1 folders with depth 1', async () => {
        const output = `${defaultOptions.output}/merge04`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            level: 1,
            depth: 1,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot with a full cover page', async () => {
        const output = `${defaultOptions.output}/cover01`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            cover: true,
            title: 'Title: %dossiersource%',
            subtitle: 'Author: xxx%ligne%Version: yyy',
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot with a cover page with empty logo, title and subtitle', async () => {
        const output = `${defaultOptions.output}/cover02`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            cover: true,
            logo: '',
            title: '',
            subtitle: '',
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot with a document outline', async () => {
        const output = `${defaultOptions.output}/outline`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            documentOutline: true,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot with a changelog', async () => {
        const output = `${defaultOptions.output}/changelog`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            changelog: true,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      it('should match the snapshot with page numbers', async () => {
        const output = `${defaultOptions.output}/pageNumbers`;
        await PdfAggregator.aggregate(
          {
            ...defaultOptions,
            output,
            pageNumbers: true,
          },
          jest.fn(),
        );
        const result = await snapshotPdfFiles(output);
        expect(result).toMatchSnapshot();
      });

      // it('should match the snapshot with a table of content', async () => {
      //   const output = `${defaultOptions.output}/toc`;
      //   await PdfAggregator.aggregate(
      //     {
      //       ...defaultOptions,
      //       output,
      //       toc: true,
      //     },
      //     jest.fn(),
      //   );
      // const result = await snapshotPdfFiles(output);
      // expect(result).toMatchSnapshot();
      // });
    });
  });
});

describe('todo', () => {
  it('should send localized messages (i18n)');
});
