const debug = require('debug')('app:utils/pdfaggregator.test.js');
const fs = require('fs-extra');
const resolvePath = require('app-root-path').resolve;
const snapshotPdfFiles = require('../../testutils/snapshotpdffiles');
const PdfAggregator = require('./pdfaggregator');

jest.setTimeout(15000); // Give some slack to the filesystem operations

const testbed = resolvePath('main/utils/__testbed__').replace(/\\/g, '/');

const defaultOptions = {
  input: `${testbed}/pdfaggregator/input`,
  level: 0,
  depth: 0,
  output: `${testbed}/pdfaggregator/output`,
  filename: 'testFile',
  cover: false,
  logo: `${testbed}/pdfaggregator/logo/image.jpg`,
  title: 'Titre: %dossiersource%',
  subtitle: 'Auteur: xxx%ligne%Version: %dateiso%',
  changelog: false,
  documentOutline: false,
  toc: false,
  pageNumbers: false,
};

const outputFolders = [
  'allIn',
  'changelog',
  'cover01',
  'cover02',
  'makeEmptyPdf',
  'merge01',
  'merge02',
  'merge03',
  'merge04',
  'outline',
  'no-blank-merge',
  'no-cover-merge',
  'pageNumbers',
  'terminate',
  'toc',
];

beforeAll(async (done) => {
  try {
    const promises = [];
    for (let i = 0; i < outputFolders.length; i += 1) {
      promises.push(fs.emptyDir(`${defaultOptions.output}/${outputFolders[i]}`));
    }
    await Promise.all(promises);
  } catch (e) {
    debug(e);
  }
  done();
});

describe('PDF Aggregator', () => {
  describe('the job terminator mechanism', () => {
    it('should force an async step to throw an error', async () => {
      PdfAggregator.terminateJob();
      expect(PdfAggregator.stepAsync('async step', async () => true, jest.fn())).rejects.toThrow();
    });

    it('should force a sync step to throw an error', () => {
      PdfAggregator.terminateJob();
      expect(() => PdfAggregator.step('step', () => true, jest.fn())).toThrow();
    });
  });

  describe('the async crawlFolder function', () => {
    it('should return a valid snapshot', async () => {
      expect.assertions(1);
      let tree = await PdfAggregator.crawlFolder(defaultOptions.input).catch(e => debug(e));
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
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate([], defaultOptions);
      expect(foldersToAggregate).toEqual([]);
    });

    it('should return the input folder\'s path for level 0', async () => {
      expect.assertions(1);
      const expectedValue = [defaultOptions.input.split('__testbed__')[1]];
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input).catch(e => debug(e));
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, defaultOptions)
        .map(element => element.split('__testbed__')[1], []);
      expect(foldersToAggregate).toEqual(expectedValue);
    });

    it('should match the snapshot of the folders at level 1', async () => {
      expect.assertions(1);
      const tree = await PdfAggregator.crawlFolder(defaultOptions.input).catch(e => debug(e));
      const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: 1 })
        .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
      expect(foldersToAggregate).toMatchSnapshot();
    });

    it(
      'should match the snapshot of the folders at the tree\'s max depth, if the level provided is greater than it',
      async () => {
        expect.assertions(1);
        const tree = await PdfAggregator.crawlFolder(defaultOptions.input).catch(e => debug(e));
        const foldersToAggregate = PdfAggregator.getFoldersToAggregate(tree, { ...defaultOptions, level: Infinity })
          .map(element => `[MOCKED_OS_SPECIFIC_PATH]${element.split('__testbed__')[1]}`, []);
        expect(foldersToAggregate).toMatchSnapshot();
      },
    );
  });

  describe('the getSubTree function', () => {
    const data = [
      { fullPath: '', depth: 0 },
      { fullPath: 'file1.pdf', depth: 0 },
      { fullPath: '/file/', depth: 1 },
      { fullPath: '/file/path/', depth: 2 },
      { fullPath: '/file/path/file1.pdf', depth: 3 },
      { fullPath: '/file/path/folder1', depth: 3 },
      { fullPath: '/file/path/folder1/file1.pdf', depth: 4 },
      { fullPath: '/file/another/path', depth: 3 },
      { fullPath: '/file/another/path/file1.pdf', depth: 4 },
    ];

    it('should throw an error if the tree is empty', () => {
      expect(() => {
        PdfAggregator.getSubTree([{ fullPath: '/file/path', depth: 5 }], '/another/path/');
      }).toThrowError('There is no file to aggregate');
    });

    it('should match the snapshot of the subtree with an unlimited depth', () => {
      const files = PdfAggregator.getSubTree(data, '/file/path/');
      expect(files).toMatchSnapshot();
    });

    it('should match the snapshot of the subtree with a limited depth', () => {
      const files = PdfAggregator.getSubTree(data, '/file/path/', 3);
      expect(files).toMatchSnapshot();
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
    const mockedDate = new Date(Date.UTC(0, 0, 0, 0, 0, 0));

    it('should not modify an input with unknown placeholders', () => {
      const input = 'an input with %unknown% %placeholders%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, mockedDate);
      expect(result).toBe('an input with %unknown% %placeholders%');
    });

    it('should replace %dossiersource% or %inputfolder% by the input folder\'s name', () => {
      const input = '%dossiersource%|%inputfolder%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, mockedDate);
      expect(result).toBe('input|input');
    });

    it('should replace %dateiso% or %isodate% by the ISO date', () => {
      const input = '%dateiso%|%isodate%';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, mockedDate);
      expect(result).toBe('1899-12-31|1899-12-31');
    });

    it('should replace %ligne% or %line% by \\n', () => {
      const input = 'ligne 1%ligne%ligne 2%line%ligne 3';
      const result = PdfAggregator.fillPlaceholders(input, defaultOptions.input, mockedDate);
      expect(result).toBe('ligne 1\nligne 2\nligne 3');
    });
  });

  describe('the calculatePages function', () => {
    const itemsOnFirstPage = 29;
    const itemsOnOtherPages = 31;

    it('should throw an error if the number of elements is negative', () => {
      expect(() => PdfAggregator.calculatePages(-5)).toThrow();
    });

    it('should throw an error if the number of elements is not an integer', () => {
      expect(() => PdfAggregator.calculatePages('NaN')).toThrow();
    });

    it('should return 1 if the number of elements is 0', () => {
      const result = PdfAggregator.calculatePages(0);
      expect(result).toBe(1);
    });

    it('should return 1 if the number of elements is below the number of items on the first page', () => {
      const result = PdfAggregator.calculatePages(itemsOnFirstPage - 2);
      expect(result).toBe(1);
    });

    it('should return 1 if the number of elements equals the number of items on the first page', () => {
      const result = PdfAggregator.calculatePages(itemsOnFirstPage);
      expect(result).toBe(1);
    });

    it('should return 2 if the number of elements equals `itemsOnFirstPage + itemsOnOtherPages`', () => {
      const result = PdfAggregator.calculatePages(itemsOnFirstPage + itemsOnOtherPages);
      expect(result).toBe(2);
    });

    it('should return 3 if the number of elements equals `itemsOnFirstPage + itemsOnOtherPages + 1`', () => {
      const result = PdfAggregator.calculatePages(itemsOnFirstPage + itemsOnOtherPages + 1);
      expect(result).toBe(3);
    });

    it('should return 4 if the number of elements equals `itemsOnFirstPage + ( 2 * itemsOnOtherPages ) + 1`', () => {
      const result = PdfAggregator.calculatePages(itemsOnFirstPage + (2 * itemsOnOtherPages) + 1);
      expect(result).toBe(4);
    });
  });

  describe('the async function countPages', () => {
    it('should return 1 for a pdf with 1 page', async () => {
      expect.assertions(1);
      const result = await PdfAggregator
        .countPages(`${defaultOptions.input}/Folder_01/Folder_01_Subfolder_01/Folder_01_Subfolder_01_File_01.pdf`)
        .catch(e => debug(e));
      expect(result).toBe(1);
    });

    it('should return 2 for a pdf with 2 pages', async () => {
      expect.assertions(1);
      const result = await PdfAggregator
        .countPages(`${defaultOptions.input}/Folder_01/Folder_01_Subfolder_01/Folder_01_Subfolder_01_File_02.pdf`)
        .catch(e => debug(e));
      expect(result).toBe(2);
    });
  });

  describe('the async makeEmptyPdf function', () => {
    it('should make an empty pdf document to use as a template', async () => {
      const output = `${defaultOptions.output}/makeEmptyPdf`;
      expect.assertions(1);
      await PdfAggregator.makeEmptyPdf(output).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
          subtitle: 'Author: xxx%ligne%Version: %dateiso%',
        },
        jest.fn(),
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
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
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });

    it('should match the snapshot with a table of content', async () => {
      const output = `${defaultOptions.output}/toc`;
      await PdfAggregator.aggregate(
        {
          ...defaultOptions,
          output,
          toc: true,
        },
        jest.fn(),
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });

    it('should match the snapshot with every available formatting options activated', async () => {
      const output = `${defaultOptions.output}/allIn`;
      await PdfAggregator.aggregate(
        {
          ...defaultOptions,
          output,
          cover: true,
          pageNumbers: true,
          toc: true,
          changelog: true,
          documentOutline: true,
        },
        jest.fn(),
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });

    it('should match the snapshot when the job is terminated', async () => {
      const output = `${defaultOptions.output}/terminate`;
      PdfAggregator.terminateJob();
      await PdfAggregator.aggregate(
        {
          ...defaultOptions,
          output,
          cover: true,
          pageNumbers: true,
          toc: true,
          changelog: true,
          documentOutline: true,
        },
        jest.fn(),
        true,
        true,
      ).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });

    it('should not merge pdf files named _blank.pdf', async () => {
      const output = `${defaultOptions.output}/no-blank-merge`;
      const copyFiles = [
        fs.copyFile(`${defaultOptions.input}/File_01.pdf`, `${output}/File_01.pdf`),
        fs.copyFile(`${defaultOptions.input}/_blank.pdf`, `${output}/_blank.pdf`),
      ];
      await Promise.all(copyFiles).catch(e => debug(e));
      await PdfAggregator.aggregate(
        {
          ...defaultOptions,
          input: output,
          output,
        },
        jest.fn(),
        true,
        true,
      ).catch(e => debug(e));
      await fs.unlink(`${output}/File_01.pdf`).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });

    it('should not merge pdf files named _cover.pdf', async () => {
      const output = `${defaultOptions.output}/no-cover-merge`;
      const copyFiles = [
        fs.copyFile(`${defaultOptions.input}/File_01.pdf`, `${output}/File_01.pdf`),
        fs.copyFile(`${defaultOptions.input}/_cover.pdf`, `${output}/_cover.pdf`),
      ];
      await Promise.all(copyFiles).catch(e => debug(e));
      await PdfAggregator.aggregate(
        {
          ...defaultOptions,
          input: output,
          output,
        },
        jest.fn(),
        true,
        true,
      ).catch(e => debug(e));
      const unlink = [
        await fs.unlink(`${output}/_cover.pdf`).catch(e => debug(e)),
        await fs.unlink(`${output}/File_01.pdf`).catch(e => debug(e)),
      ];
      await Promise.all(unlink).catch(e => debug(e));
      const result = await snapshotPdfFiles(output).catch(e => debug(e));
      expect(result).toMatchSnapshot();
    });
  });
});
