const aggregate = require('./pdfaggregator');

const options = {
  input: 'D:\\Users\\bourgeonjp\\Downloads',
  output: 'D:\\Users\\bourgeonjp\\Downloads',
  logo: 'D:\\Users\\bourgeonjp\\Documents\\livethecode_logo\\livethecode_bin.png',
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%%ligne%%datefr%',
  level: 0,
  cover: true,
  changelog: true,
  bookmarks: true,
};

aggregate(options);
