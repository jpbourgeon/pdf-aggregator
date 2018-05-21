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
    await task()
      .catch(e => console.log(`${taskName}: ${e.message}`)); // eslint-disable-line no-console
    addLogEntry(send, taskName, false, isLast);
  } catch (e) {
    addLogEntry(send, `${taskName}: ${e.message}`, true, errorIsFatal);
  }
};

const step = (taskName, task, send, errorIsFatal = false, isLast = false) => {
  try {
    setCurrentTask(send, taskName);
    task();
    addLogEntry(send, taskName, false, isLast);
  } catch (e) {
    addLogEntry(send, `${taskName}: ${e.message}`, true, errorIsFatal);
  }
};

const crawlFolder = async (path) => {
  let tree;
  if (path !== '') {
    tree = await getTree({ root: path, entryType: 'both', fileFilter: '*.pdf' })
      .catch(e => console.log(`getTree: ${e.message}`)); // eslint-disable-line no-console
  } else {
    tree = [];
  }
  return tree;
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
  const doc = new pdf.Document({ font: Helvetica });
  doc.text();
  doc.info.id = '_blank';
  doc.info.producer = 'pdf-aggregator: _blank template';
  const write = fs.createWriteStream(`${folder}/_blank.pdf`);
  doc.pipe(write);
  await doc.end()
    .catch(e => console.log(`makeEmptyPdf > doc.end: ${e.message}`)); // eslint-disable-line no-console
  write.on('finish', resolve);
  write.on('error', reject);
});

const deduplicatePdfPath = async (path, pathExistsDI = fs.pathExists) => {
  const file = path.substring(0, path.length - 4);
  let i = 0;
  while (await pathExistsDI(`${file}${(i > 0) ? `_${i}` : ''}.pdf`) // eslint-disable-line no-await-in-loop
    .catch((e) => {
      console.log(`pathExists: ${e.message}`); // eslint-disable-line no-console
      return false;
    })
  ) i += 1;
  const result = `${file}${(i > 0) ? `_${i}` : ''}.pdf`;
  return result;
};

const aggregate = async (data, send) => {
  try {
    const dateIso = new Date().toISOString().substr(0, 10);

    // Prepare the empty template
    await stepAsync('Création du modèle de page vierge', async () => {
      await makeEmptyPdf(data.output)
        .catch(e => console.log(`makeEmptyPdf: ${e.message}`)); // eslint-disable-line no-console
    }, send, true);

    // Read the input tree
    let tree;
    await stepAsync('Lecture du dossier source', async () => {
      tree = await crawlFolder(data.input)
        .catch(e => console.log(`crawlFolder: ${e.message}`)); // eslint-disable-line no-console
    }, send, true);

    // Get the list of folders to aggregate
    let foldersToAggregate;
    step(
      'Récupération des dossiers à fusionner',
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); }, send, true,
    );

    // Process each folder that will be aggregated
    await Promise.all(foldersToAggregate.map(async (folder) => {
      // Prepare the input folder
      let subTree;
      step(`Préparation du dossier source : ${folder}`, () => {
        const maxDepth = (data.depth === -1) ? Infinity : data.level + data.depth;
        subTree = getSubTree(tree, folder, maxDepth);
        subTree = stripEmptyFolders(subTree);
      }, send);

      // Prepare the output filename
      let filename;
      step('Calcul du nom du fichier cible', () => {
        filename = data.filename
          .replace('%dossiersource%', folder.split('/').pop())
          .replace('%dateiso%', dateIso);
      }, send);

      const doc = new pdf.Document({ font: Helvetica });

      // If asked: generate the cover page (if asked: don't forget to add the bookmark)
      if (data.cover) step('Génération de la couverture', () => true, send);

      // If asked: generate the table of content (if asked: don't forget to add the bookmark and the pages numbers)
      if (data.changelog) step('Génération du journal des modifications', () => true, send);

      // If asked: generate the change log (if asked: don't forget to add the bookmark)
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
          const path = await deduplicatePdfPath(`${data.output}/${filename}.pdf`)
            .catch(e => console.log(`deduplicatePdfPath: ${e.message}`)); // eslint-disable-line no-console
          const write = fs.createWriteStream(path);
          doc.pipe(write);
          await doc.end()
            .catch(e => console.log(`aggregate > doc.end: ${e.message}`)); // eslint-disable-line no-console
          write.on('finish', resolve);
          write.on('error', reject);
        }),
        send,
      );
    }));

    // Final step
    step('Traitement terminé', () => true, send, true, true);
  } catch (e) {
    console.log(`pdfAggregator: ${e.message}`); // eslint-disable-line no-console
    step(`Le traitement a échoué: ${e.message}`, () => true, send, true, true);
  }

  // Remove the empty template
  await stepAsync('Suppression du modèle de page vierge', async () => {
    await fs.remove(`${data.output}/_blank.pdf`)
      .catch(e => console.log(`aggregate > fs.remove: ${e.message}`)); // eslint-disable-line no-console
  }, send, true);
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
