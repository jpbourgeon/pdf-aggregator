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

const crawlFolder = async (path) => {
  try {
    let tree;
    if (path !== '') {
      tree = await getTree({ root: path, entryType: 'both', fileFilter: '*.pdf' });
    } else {
      tree = [];
    }
    return tree;
  } catch (error) {
    throw (error);
  }
};

const aggregate = async (send, data) => {
  let tree;
  let foldersToAggregate;

  setCurrentTask(send, 'Lecture du dossier source');
  try {
    tree = await crawlFolder(data.input);
    addLogEntry(send, 'Lecture du dossier source');
  } catch (error) {
    addLogEntry(send, 'Lecture du dossier source', true, true);
    /* eslint-disable-next-line */
    console.log(error);
    return false;
  }

  setCurrentTask(send, 'Traitement terminé');
  console.log({ tree, foldersToAggregate });
  addLogEntry(send, 'Traitement terminé', false, true);
  return true;
};

module.exports = {
  aggregate,
  crawlFolder,
};
