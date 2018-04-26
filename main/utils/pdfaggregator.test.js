const fs = require('fs-extra-promise');
const { resolve } = require('app-root-path');
const snapshotPdfFiles = require('./__testutils__/snapshotpdffiles');
const aggregate = require('./pdfaggregator');

const testbed = resolve('main/utils/__testbed__/');

const defaultOptions = {
  input: `${testbed}/pdfaggregator/input`,
  output: `${testbed}/pdfaggregator/output`,
  logo: `${testbed}/pdfaggregator/logo/image.jpg`,
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%%ligne%%datefr%',
  level: 0,
  changelog: true,
  bookmarks: true,
};

beforeAll(() => {
  // discard the output folder's content
  fs.emptyDirSync(`${testbed}/pdfaggregator/output`);
});

describe('PDF Aggregator', () => {
  it('should work as expected');
});

// const options = {
//   ...defaultOptions,
//   output: `${defaultOptions.output}/folder_of_the_test`,
// };
