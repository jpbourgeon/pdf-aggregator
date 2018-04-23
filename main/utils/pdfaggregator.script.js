const aggregate = require('./pdfaggregator');

const options = {
  input: 'D:\\Users\\bourgeonjp\\Documents\\eBooks',
  output: 'D:\\Users\\bourgeonjp\\Documents\\eBooks',
  logo: 'D:\\Users\\bourgeonjp\\Documents\\livethecode_logo\\logo.png',
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%%ligne%%datefr%',
  level: 0,
  changelog: true,
  bookmarks: true,
};

aggregate(options);
