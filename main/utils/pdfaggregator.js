const { getTree } = require('./gettree');

const setCurrentTask = (send, label) => {
  send('set-current-task', label);
};

const addLogEntry = (send, label, isError = false, isLast = false) => {
  send('add-log-entry', {
    date: new Date(),
    isError,
    isLast,
    label,
  });
};

const stepAsync = async (taskName, task, send, errorIsFatal = false, isLast = false) => {
  setCurrentTask(send, taskName);
  try {
    await task();
    addLogEntry(send, taskName, false, isLast);
  } catch (error) {
    addLogEntry(send, taskName, true, errorIsFatal);
    throw (error);
  }
};

const step = (taskName, task, send, errorIsFatal = false, isLast = false) => {
  setCurrentTask(send, taskName);
  try {
    task();
    addLogEntry(send, taskName, false, isLast);
  } catch (error) {
    addLogEntry(send, taskName, true, errorIsFatal);
    throw (error);
  }
};

const crawlFolder = async (path) => {
  let tree;
  if (path !== '') {
    tree = await getTree({ root: path, entryType: 'both', fileFilter: '*.pdf' });
  } else {
    tree = [];
  }
  return tree;
};

const getFoldersToAggregate = (tree, data) => {
  if (tree.length === 0) throw new Error('There is nothing to aggregate');
  if (data.level === 0) {
    return [data.input];
  }
  return tree
    .reduce((result, item) => {
      if (item.type === 'directory' && item.depth === data.level) result.push(item.fullPath);
      return result;
    }, []);
};

// const getFilesToAggregate = (tree, data) => {
//   if (tree.length === 0) throw new Error('There is nothing to aggregate');
//   if (data.level === 0) {
//     return [data.input];
//   }
//   return tree
//     .reduce((result, item) => {
//       if (item.type === 'directory' && item.depth === data.level) result.push(item.fullPath);
//       return result;
//     }, []);
// };

const aggregate = async (data, send) => {
  let tree;
  let foldersToAggregate;
  try {
    await stepAsync('Lecture du dossier source', async () => { tree = await crawlFolder(data.input); }, send, true);
    await step(
      'Récupération des dossiers à fusionner',
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); }, send, true,
    );
    console.log(foldersToAggregate);
    // For each folder to aggregate:
    // Get a list of the files
    // If needed: Generate cover page (don't forget the bookmark)
    // If needed: Generate log of modifications (don't forget the bookmark)
    // merge each file (don't forget the bookmark)
    await step('Traitement terminé', () => true, send, true, true);
  } catch (error) {
    /* eslint-disable-next-line */
    console.log(error);
  }
};

module.exports = {
  aggregate,
  crawlFolder,
  getFoldersToAggregate,
};
