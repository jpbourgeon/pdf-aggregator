const { getTree } = require('./gettree');

const crawlFolder = async (path) => {
  try {
    let tree;
    if (path !== '') {
      tree = await getTree({ root: path, entryType: 'both', filesFilter: '*.pdf' });
    } else {
      tree = [];
    }
    return tree;
  } catch (error) {
    throw (error);
  }
};

const main = async (data) => {
  try {
    const tree = await crawlFolder(data.input);
    /* eslint-disable-next-line */
    console.log(tree);
  } catch (error) {
    /* eslint-disable-next-line */
    console.log(error);
  }
};

module.exports = main;
