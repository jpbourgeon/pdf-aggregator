const debug = require('debug')('app:utils/pdfaggregator.js');
const fs = require('fs-extra');
const pdf = require('pdfjs');
const Helvetica = require('pdfjs/font/Helvetica');
const HelveticaBold = require('pdfjs/font/Helvetica-Bold');
const { getTree } = require('./gettree');


let currentDate = new Date();
const mockedDate = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
let jobIsTerminated = false;

const terminateJob = () => {
  jobIsTerminated = true;
};

const resetJobTerminator = () => {
  jobIsTerminated = false;
};


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

const stepAsync = async (taskName, task, send, errorIsFatal = false, isLast = false, force = false) => {
  try {
    setCurrentTask(send, taskName);
    if (jobIsTerminated && !force) throw new Error('le traitement a été interrompu par l\'utilisateur');
    await task();
    addLogEntry(send, taskName, false, isLast);
    return Promise.resolve();
  } catch (e) {
    addLogEntry(send, `${taskName}: ${e.message}`, true, errorIsFatal);
    if (errorIsFatal || jobIsTerminated) return Promise.reject(e);
    return Promise.resolve();
  }
};

const step = (taskName, task, send, errorIsFatal = false, isLast = false, force = false) => {
  try {
    setCurrentTask(send, taskName);
    if (jobIsTerminated && !force) throw new Error('le traitement a été interrompu par l\'utilisateur');
    task();
    addLogEntry(send, taskName, false, isLast);
  } catch (e) {
    addLogEntry(send, `${taskName}: ${e.message}`, true, errorIsFatal);
    if (errorIsFatal || jobIsTerminated) throw e;
  }
};

const crawlFolder = async (path) => {
  let tree;
  if (path !== '') {
    tree = await getTree({ root: path, entryType: 'both', fileFilter: '*.pdf' }).catch(e => debug(e));
  } else {
    tree = [];
  }
  return tree;
};

const getFoldersToAggregate = (tree = [], data) => {
  if (tree.length === 0) return [];
  const maxDepth = tree.reduce((result, item) => ((item.depth > result) ? item.depth : result), 0);
  const level = (data.level < maxDepth) ? data.level : maxDepth;
  if (level === 0) return [data.input];
  const folders = tree.reduce((result, item) => {
    if (item.type === 'directory' && item.depth === level) result.push(item.fullPath);
    return result;
  }, []);
  return folders;
};

const getSubTree = (tree, folder, maxDepth = Infinity, mockDate = false) => {
  const files = tree.reduce((result, item) => {
    const element = item;
    if (mockDate) element.lastModified = mockedDate;
    if (item.fullPath.startsWith(folder) && item.depth <= maxDepth) result.push(element);
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

const deduplicatePdfPath = async (path, pathExistsDI = fs.pathExists) => {
  const file = path.substring(0, path.length - 4);
  let i = 0;
  while (await pathExistsDI(`${file}${(i > 0) ? `_${i}` : ''}.pdf`) // eslint-disable-line no-await-in-loop
    .catch((e) => {
      debug(e);
      return false;
    })
  ) i += 1;
  const result = `${file}${(i > 0) ? `_${i}` : ''}.pdf`;
  return result;
};

const fillPlaceholders = (field, inputFolder, when) => {
  const result = field
    .replace('%dossiersource%', inputFolder.split('/').pop())
    .replace('%inputfolder%', inputFolder.split('/').pop())
    .replace('%dateiso%', when.toISOString().substr(0, 10))
    .replace('%isodate%', when.toISOString().substr(0, 10))
    .replace('%ligne%', '\n')
    .replace('%line%', '\n');
  return result;
};

const calculatePages = (itemsNumber, itemsOnFirstPage = 29, itemsOnOtherPages = 31) => {
  if (itemsNumber < 0 || Number.isNaN(parseInt(itemsNumber, 10))) throw new Error('Invalid itemsNumber');
  if (itemsNumber === 0 || itemsNumber <= itemsOnFirstPage) return 1;
  const div = Math.trunc((itemsNumber - itemsOnFirstPage) / 31);
  let rem = (itemsNumber - itemsOnFirstPage) % itemsOnOtherPages;
  if (rem > 0) rem = 1;
  return (1 + div + rem);
};

const countPages = async (fullPath) => {
  const file = await fs.readFile(fullPath).catch(e => debug(e));
  const pdfFile = new pdf.ExternalDocument(file);
  return pdfFile.pageCount;
};

const makeEmptyPdf = async folder => new Promise(async (resolve, reject) => {
  const doc = new pdf.Document({ font: Helvetica });
  doc.text();
  const write = fs.createWriteStream(`${folder}/_blank.pdf`);
  doc.pipe(write);
  await doc.end().catch(e => debug(e));
  write.on('finish', resolve);
  write.on('error', reject);
});

const aggregate = async (data, send, isTest = false, testJobTerminator = false) => {
  try {
    if (isTest) currentDate = mockedDate;
    if (!testJobTerminator) resetJobTerminator();

    // Start the job
    step('Début du traitement', () => true, send);

    // Read the input tree
    let tree;
    await stepAsync('Lecture du dossier source', async () => {
      tree = await crawlFolder(data.input).catch(e => debug(e));
    }, send, true);

    // Prepare the empty template
    let pdfEmpty;
    await stepAsync('Création du modèle de page vierge', async () => {
      await makeEmptyPdf(data.output).catch(e => debug(e));
      const empty = await fs.readFile(`${data.output}/_blank.pdf`).catch(e => debug(e));
      pdfEmpty = new pdf.ExternalDocument(empty);
    }, send, true);

    // Get the list of folders to aggregate
    let foldersToAggregate = [];
    step(
      'Récupération des dossiers à fusionner',
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); },
      send,
      true,
    );

    // Process each folder that will be aggregated
    if (foldersToAggregate.length !== 0) {
      await Promise.all(foldersToAggregate.map(async (folder) => {
      // Prepare the input folder
        let subTree;
        step(`Préparation du dossier source : ${folder}`, () => {
          const maxDepth = (data.depth <= 0) ? Infinity : data.level + data.depth;
          subTree = getSubTree(tree, folder, maxDepth, isTest);
          subTree = stripEmptyFolders(subTree);
        }, send);

        if (subTree.length !== 0) {
          const doc = new pdf.Document({ font: Helvetica, fontSize: 11 });

          // Cover page
          if (data.cover) {
            await stepAsync('Génération de la couverture', async () => {
              doc.text('  ', { fontSize: 96, color: '0xffffff' });
              if (data.logo) {
                const image = await fs.readFile(data.logo).catch(e => debug(e));
                const logo = new pdf.Image(image);
                doc.image(logo, {
                  height: logo.height * 0.75, // pixels to points
                  width: logo.width * 0.75, // pixels to points
                  align: 'center',
                });
              }
              doc.text(fillPlaceholders(data.title, data.input, currentDate), {
                font: HelveticaBold,
                fontSize: 48,
                textAlign: 'center',
              });
              doc.text(fillPlaceholders(data.subtitle, data.input, currentDate), {
                font: HelveticaBold,
                fontSize: 24,
                textAlign: 'center',
              });
              if (!data.pageNumbers && (data.toc || data.changelog)) doc.pageBreak();
            }, send);
          }

          // Page numbers
          if (data.pageNumbers) {
            step('Numérotation des pages', () => {
              const footer = doc.footer();
              footer.pageNumber(
                (curr, total) => (`${curr} / ${total}`),
                { textAlign: 'center' },
              );
            }, send);
          }

          // Generate the table of content (if asked: don't forget to add the bookmark)
          if (data.toc) {
            await stepAsync('Génération de la table des matières', async () => {
              doc.text();
              doc.destination('%toc%');
              if (data.documentOutline) doc.outline('Table des matières', '%toc%');
              doc.text('Table des matières\n\n', {
                font: HelveticaBold,
                fontSize: 18,
              });
              const table = doc.table({
                widths: [null, 3 * pdf.cm],
                borderHorizontalWidths: i => ((i < 2) ? 1 : 0.1),
                padding: 5,
              });
              const header = table.header({
                font: HelveticaBold,
                marginTop: 5,
                backgroundColor: '0x666666',
                color: '0xffffff',
              });
              header.cell('Contenu');
              header.cell('Page', { textAlign: 'right' });
              const addRow = (name, destination, page = '') => {
                const row = table.row();
                row.cell().text(name, { goTo: destination });
                row.cell().text(page, { goTo: destination, textAlign: 'right' });
              };
              let pageNumber = 1;
              if (data.cover) pageNumber += 1;
              pageNumber += calculatePages(subTree.length);
              if (data.changelog) {
                addRow('Journal des modifications', '%changelog%', pageNumber.toString());
                pageNumber += calculatePages(subTree.filter(item => (item.type === 'file')).length);
              }
              const files = subTree.filter(item => (item.type === 'file'));
              for (let i = 0; i < files.length; i += 1) {
                const item = files[i];
                let label = item.fullPath.substr(data.input.length + 1);
                label = label.substr(0, label.length - 4);
                addRow(
                  label,
                  item.fullPath.substr(data.input.length + 1),
                  pageNumber.toString(),
                );
                pageNumber += await countPages(item.fullPath); // eslint-disable-line no-await-in-loop
              }
              if (data.changelog) doc.pageBreak();
            }, send);
          }

          // Changelog
          if (data.changelog) {
            step('Génération du journal des modifications', () => {
              doc.text();
              doc.destination('%changelog%');
              if (data.documentOutline) doc.outline('Journal des modifications', '%changelog%');
              doc.text('Journal des modifications\n\n', {
                font: HelveticaBold,
                fontSize: 18,
              });
              const table = doc.table({
                widths: [null, 3 * pdf.cm],
                borderHorizontalWidths: i => ((i < 2) ? 1 : 0.1),
                padding: 5,
              });
              const header = table.header({
                font: HelveticaBold,
                marginTop: 5,
                backgroundColor: '0x666666',
                color: '0xffffff',
              });
              header.cell('Document');
              header.cell('Date', { textAlign: 'right' });
              const addRow = (name, destination, modified) => {
                const row = table.row();
                row.cell().text(name, { goTo: destination });
                row.cell().text(modified, { goTo: destination, textAlign: 'right' });
              };
              let files = subTree.filter(item => (item.type === 'file'));
              files = files.sort((a, b) => {
                if (a.lastModified.toISOString() < b.lastModified.toISOString()) return -1;
                if (a.lastModified.toISOString() > b.lastModified.toISOString()) return 1;
                return 0;
              });
              for (let i = 0; i < files.length; i += 1) {
                const item = files[i];
                let label = item.fullPath.substr(data.input.length + 1);
                label = label.substr(0, label.length - 4);
                addRow(
                  label,
                  item.fullPath.substr(data.input.length + 1),
                  item.lastModified.toISOString().substr(0, 10),
                );
              }
            }, send);
          }

          // merge files
          let foldersBuffer = [];
          for (let i = 0; i < subTree.length; i += 1) {
            const item = subTree[i];
            // eslint-disable-next-line no-await-in-loop, no-loop-func
            await stepAsync(`Fusion de l'élément ${item.name}`, async () => {
              if (item.type === 'file') {
                const file = await fs.readFile(item.fullPath).catch(e => debug(e));
                const pdfFile = new pdf.ExternalDocument(file);
                doc.setTemplate(pdfFile);
                doc.text();
                while (foldersBuffer.length !== 0) {
                  const folderItem = foldersBuffer.shift();
                  const folderName = folderItem.fullPath.substr(data.input.length + 1);
                  let folderParent = folderName.split('/');
                  folderParent.pop();
                  folderParent = folderParent.join('/');
                  doc.destination(folderName);
                  if (data.documentOutline) doc.outline(folderName, folderName, folderParent);
                }
                let itemParent = item.fullPath.substr(data.input.length + 1).split('/');
                itemParent.pop();
                itemParent = itemParent.join('/');
                doc.destination(item.fullPath.substr(data.input.length + 1));
                if (data.documentOutline) {
                  doc.outline(
                    item.name.substr(0, item.name.length - 4),
                    item.fullPath.substr(data.input.length + 1),
                    itemParent,
                  );
                }
                for (let j = 2; j <= pdfFile.pageCount; j += 1) {
                  const otherPage = new pdf.Document({ font: Helvetica, fontSize: 11 });
                  otherPage.addPageOf(j, pdfFile);
                  const otherPageDoc = await otherPage.asBuffer(); // eslint-disable-line no-await-in-loop
                  const extOtherPage = new pdf.ExternalDocument(otherPageDoc);
                  doc.setTemplate(extOtherPage);
                  doc.text();
                }
                doc.setTemplate(pdfEmpty);
                foldersBuffer = [];
              } else {
                foldersBuffer.push(item);
              }
            }, send);
          }

          // save the file into the output folder
          const filename = fillPlaceholders(data.filename, data.input, currentDate);
          await stepAsync(
            `Enregistrement du fichier : ${filename}.pdf`,
            () => new Promise(async (resolve, reject) => {
              const path = await deduplicatePdfPath(`${data.output}/${filename}.pdf`).catch(e => debug(e));
              const write = fs.createWriteStream(path);
              doc.pipe(write);
              await doc.end().catch(e => debug(e));
              write.on('finish', resolve);
              write.on('error', reject);
            }),
            send,
          );
        } else {
          step(`Le dossier source est vide : ${folder}`, () => true, send);
        }
      }));
      // Final step
      step('Traitement terminé', () => true, send);
    } else {
      step('Traitement terminé: il n\'y avait rien à fusionner', () => true, send);
    }
  } catch (e) {
    debug(e);
    addLogEntry(send, `Le traitement s'est achevé en erreur: ${e.message}`, true, false);
  }

  // Remove the empty template -- by force if the job has been terminated manually
  await stepAsync('Suppression du modèle de page vierge', async () => {
    await fs.remove(`${data.output}/_blank.pdf`).catch(e => debug(e));
  }, send, false, true, true);
};

module.exports = {
  crawlFolder,
  getFoldersToAggregate,
  getSubTree,
  stripEmptyFolders,
  deduplicatePdfPath,
  fillPlaceholders,
  calculatePages,
  countPages,
  makeEmptyPdf,
  aggregate,
  terminateJob,
  step,
  stepAsync,
};
