const fs = require('fs-extra');
const pdf = require('pdfjs');
const Helvetica = require('pdfjs/font/Helvetica');
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
  try {
    setCurrentTask(send, taskName);
    await task();
    addLogEntry(send, taskName, false, isLast);
  } catch (error) {
    addLogEntry(send, taskName, true, errorIsFatal);
    console.log(error); // eslint-disable-line no-console
  }
};

const step = (taskName, task, send, errorIsFatal = false, isLast = false) => {
  try {
    setCurrentTask(send, taskName);
    task();
    addLogEntry(send, taskName, false, isLast);
  } catch (error) {
    addLogEntry(send, taskName, true, errorIsFatal);
    console.log(error); // eslint-disable-line no-console
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
    console.log(error); // eslint-disable-line no-console
    return [];
  }
};

const getFoldersToAggregate = (tree = [], data) => {
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

const makeEmptyPdf = async folder => new Promise(async (resolve, reject) => {
  try {
    const doc = new pdf.Document({ font: Helvetica });
    doc.text();
    doc.info.id = '_blank';
    doc.info.producer = 'pdf-aggregator: _blank template';
    const write = fs.createWriteStream(`${folder}/_blank.pdf`);
    doc.pipe(write);
    await doc.end();
    write.on('finish', resolve);
  } catch (error) {
    console.log(`Error: ${error}`); // eslint-disable-line no-console
    reject();
  }
});

const deduplicatePdfPath = (path) => {
  let result = path.substring(0, path.length - 4);
  if (fs.pathExistsSync(`${result}.pdf`)) {
    let i = 1;
    while (fs.pathExistsSync(`${path}_${i}.pdf`)) {
      i += 1;
    }
    result = `${result}_${i}`;
  }
  result = `${result}.pdf`;
  return result;
};

const aggregate = async (data, send) => {
  try {
    const dateIso = new Date().toISOString().substr(0, 10);

    // Prepare the empty template
    await stepAsync('Création du modèle de page vierge', async () => (makeEmptyPdf(data.output)), send, true);

    // Read the input tree
    let tree;
    await stepAsync('Lecture du dossier source', async () => {
      try {
        tree = await crawlFolder(data.input);
      } catch (error) {
        console.log(error); // eslint-disable-line no-console
      }
    }, send, true);

    // Get the list of folders to aggregate
    let foldersToAggregate;
    step(
      'Récupération des dossiers à fusionner',
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); }, send, true,
    );
    // Process each folder that will be aggregated
    await Promise.all(foldersToAggregate.map(async (folder) => {
      try {
        const filename = data.filename
          .replace('%dossiersource%', folder.split('/').pop())
          .replace('%dateiso%', dateIso);
        let subTree;
        step(`Préparation du dossier : ${folder}`, () => {
          const maxDepth = (data.depth === -1) ? Infinity : data.level + data.depth;
          subTree = getSubTree(tree, folder, maxDepth);
          subTree = stripEmptyFolders(subTree);
        }, send);

        const doc = new pdf.Document({ font: Helvetica });

        // If asked: Generate the cover page (if asked: don't forget to add the bookmark)
        if (data.cover) step('Génération de la couverture', () => true, send);

        // If asked: Generate the change log (if asked: don't forget to add the bookmark)
        if (data.changelog) step('Génération du journal des modifications', () => true, send);

        // merge each files into the pdf (if asked: don't forget to add the bookmark)
        subTree.map((item) => {
          step(`Traitement de l'élément : ${item.name}`, () => true, send);
          return true;
        });

        doc.pageBreak();

        // save the file into the output folder
        await stepAsync(
          `Enregistrement du fichier : ${filename}.pdf`,
          () => new Promise(async (resolve, reject) => {
            try {
              // Deduplicate the filepath
              const path = deduplicatePdfPath(`${data.output}/${filename}.pdf`);
              const write = fs.createWriteStream(path);
              doc.pipe(write);
              await doc.end();
              write.on('finish', resolve);
            } catch (error) {
              reject(error);
            }
          }),
          send,
        );
      } catch (error) {
        console.log(error); // eslint-disable-line no-console
      }
    }));
    step('Suppression du modèle de page vierge', () => {
      try {
        fs.removeSync(`${data.output}/_blank.pdf`);
      } catch (error) {
        console.log(error); // eslint-disable-line no-console
      }
    }, send, true);
    step('Traitement terminé', () => true, send, true, true);
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    step(`Le traitement a échoué : ${error}`, () => true, send, true, true);
  }
};

module.exports = {
  crawlFolder,
  getFoldersToAggregate,
  getSubTree,
  stripEmptyFolders,
  makeEmptyPdf,
  deduplicatePdfPath,
  aggregate,
};
