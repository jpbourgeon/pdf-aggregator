const fs = require('fs');
const { resolve } = require('app-root-path');
const aggregate = require('./pdfaggregator');

const testfolder = 'main/utils/__testbed__';

const defaultOptions = {
  input: resolve(`${testfolder}/input`),
  output: resolve(`${testfolder}/output`),
  logo: resolve(`${testfolder}/logo/image.jpg`),
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%%ligne%%datefr%',
  level: 0,
  changelog: true,
  bookmarks: true,
};

beforeAll(() => {
  // discard the output folder's content
});

describe('pdf-aggregator main process', () => {
  it('should snapshot a pdf file', () => {
    const Base64Result = Buffer
      .from(fs.readFileSync(resolve(`${testfolder}/input/Folder_00_File_01.pdf`), { encoding: 'binary' }))
      .toString('base64');
    expect(Base64Result).toMatchSnapshot();
  });

  it('should snapshot the pdf files of a folder into an array', () => {
    expect(false).toBe(true);
  });
});

// const options = {
//   ...defaultOptions,
//   output: `${defaultOptions.output}/should_snapshot_a_pdf_file`,
// };
