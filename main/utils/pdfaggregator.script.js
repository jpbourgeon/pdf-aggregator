const fs = require('fs');
const { resolve } = require('app-root-path');
const aggregate = require('./pdfaggregator');

const testfolder = 'main/utils/__testbed__';

fs.readdir(resolve(`${testfolder}/output`), (err, files) => {
  if (err) throw err;
  files.forEach((file) => {
    fs.unlink(resolve(`${testfolder}/output/${file}`), (err2) => {
      if (err2) throw err2;
    });
  });
});

const options = {
  input: resolve(`${testfolder}/input`),
  output: resolve(`${testfolder}/output`),
  logo: resolve(`${testfolder}/logo/image.jpg`),
  filename: '%dossiersource%_%dateiso%',
  title: '%dossiersource%%ligne%%datefr%',
  level: 0,
  changelog: true,
  bookmarks: true,
};

aggregate(options);
