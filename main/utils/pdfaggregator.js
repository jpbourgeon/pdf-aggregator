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

const aggregate = async (data, send) => {
  console.log(data);
  let tree;
  // let foldersToAggregate;
  try {
    await stepAsync('Lecture du dossier source', async () => { tree = await crawlFolder(data.input); }, send);
    await step('Traitement terminé', async () => (console.log(tree)), send, true, true);
  } catch (error) {
    /* eslint-disable-next-line */
    console.log(error);
  }

  // taskName = 'Lecture du dossier source';
  // setCurrentTask(send, taskName);
  // try {
  //   tree = await crawlFolder(data.input);
  //   addLogEntry(send, taskName);
  // } catch (error) {
  //   addLogEntry(send, taskName, true, true);
  //   /* eslint-disable-next-line */
  //   console.log(error);
  //   return false;
  // }

  // setCurrentTask(send, 'Traitement terminé');
  // console.log({ tree, foldersToAggregate });
  // addLogEntry(send, 'Traitement terminé', false, true);
  // return true;
};

module.exports = {
  aggregate,
  crawlFolder,
};
