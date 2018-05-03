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
  if (tree.length === 0) throw new Error('There is no folder to aggregate');
  const maxDepth = tree.reduce((result, item) => ((item.depth > result) ? item.depth : result), 0);
  const level = (data.level < maxDepth) ? data.level : maxDepth;
  if (level === 0) return [data.input];
  const folders = tree.reduce((result, item) => {
    if (item.type === 'directory' && item.depth === level) result.push(item.fullPath);
    return result;
  }, []);
  return folders;
};

const getSubTree = (tree, folder, maxDepth = Infinity) => {
  const files = tree.reduce((result, item) => {
    if (item.fullPath.startsWith(folder) && item.depth <= maxDepth) result.push(item);
    return result;
  }, []);
  if (files.length === 0) throw new Error('There is no file to aggregate');
  return files;
};

const stripEmptyFolders = (tree) => {
  const files = tree.reduce((result, item) => {
    if (item.type === 'file') result.push(item.fullPath);
    return result;
  }, []);
  const strippedTree = tree.reduce((result, item) => {
    if (files.find(file => file.startsWith(item.fullPath)) !== undefined) result.push(item);
    return result;
  }, []);
  return strippedTree;
};

const aggregate = async (data, send) => {
  let tree;
  let foldersToAggregate;
  try {
    await stepAsync('Lecture du dossier source', async () => { tree = await crawlFolder(data.input); }, send, true);
    await step(
      'Récupération des dossiers à fusionner',
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); }, send, true,
    );
    foldersToAggregate.map(async (folder) => {
    // await Promise.all(foldersToAggregate.map(async (folder) => {
      // Get a subtree without empty folders
      const maxDepth = (data.depth === -1) ? Infinity : data.level + data.depth;
      let subTree = getSubTree(tree, folder, maxDepth);
      subTree = stripEmptyFolders(subTree);
      /* eslint-disable-next-line no-console */
      console.log(JSON.stringify({
        [folder]: subTree.map(element => ({
          fullPath: element.fullPath,
          // depth: element.depth,
          // parentDir: element.parentDir,
        }), []),
      }, null, 2));
      // If needed: Generate cover page (if needed: don't forget to add the bookmark)
      // If needed: Generate log of modifications (if needed: don't forget to add the bookmark)
      // merge all files into a pdf (if needed: don't forget to add the bookmark)
    });
    // }));
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
  getSubTree,
  stripEmptyFolders,
};
