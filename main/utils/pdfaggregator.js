const fs = require('fs-extra');
const pdf = require('pdfjs');
const Helvetica = require('pdfjs/font/Helvetica');
const HelveticaBold = require('pdfjs/font/Helvetica-Bold');
const { getTree } = require('./gettree');

const formattedDate = new Date().toISOString().substr(0, 10);

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

const makeEmptyPdf = async (folder, isTest = false) => new Promise(async (resolve, reject) => {
  const doc = new pdf.Document({ font: Helvetica });
  if (isTest) {
    doc.info.id = '__MOCKED_ID__';
    doc.info.producer = '__MOCKED_PRODUCER__';
    doc.info.creationDate = new Date(0, 0, 0, 0, 0, 0, 0);
  }
  console.log(doc.info.creationDate);
  doc.text();
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

const fillPlaceholders = (field, inputFolder, isoDate) => {
  const result = field
    .replace('%dossiersource%', inputFolder.split('/').pop())
    .replace('%inputfolder%', inputFolder.split('/').pop())
    .replace('%dateiso%', isoDate)
    .replace('%isodate%', isoDate)
    .replace('%ligne%', '\n')
    .replace('%line%', '\n');
  return result;
};

const aggregate = async (data, send, isTest = false) => {
  try {
    // Prepare the empty template
    let pdfEmpty;
    await stepAsync('Création du modèle de page vierge', async () => {
      await makeEmptyPdf(data.output, isTest)
        .catch(e => console.log(`makeEmptyPdf: ${e.message}`)); // eslint-disable-line no-console
      const empty = await fs.readFile(`${data.output}/_blank.pdf`)
        .catch(e => console.log(`aggregate empty > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
      pdfEmpty = new pdf.ExternalDocument(empty);
    }, send, true);

    // Start the job
    step('Début du traitement', () => true, send);

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
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); },
      send,
      true,
    );

    // Process each folder that will be aggregated
    await Promise.all(foldersToAggregate.map(async (folder) => {
      // Prepare the input folder
      let subTree;
      step(`Préparation du dossier source : ${folder}`, () => {
        const maxDepth = (data.depth <= 0) ? Infinity : data.level + data.depth;
        subTree = getSubTree(tree, folder, maxDepth);
        subTree = stripEmptyFolders(subTree);
      }, send);

      if (subTree.length !== 0) {
        const doc = new pdf.Document({ font: Helvetica, fontSize: 11 });
        if (isTest) {
          doc.info.id = '__MOCKED_ID__';
          doc.info.producer = '__MOCKED_PRODUCER__';
          doc.info.creationDate = new Date(0, 0, 0, 0, 0, 0, 0);
        }

        // Cover page
        if (data.cover) {
          await stepAsync('Génération de la couverture', async () => {
            doc.text('  ', { fontSize: 96, color: '0xffffff' });
            if (data.logo) {
              const image = await fs.readFile(data.logo)
                // eslint-disable-next-line no-console
                .catch(e => console.log(`aggregate image > fs.readFile: ${e.message}`));
              const logo = new pdf.Image(image);
              doc.image(logo, {
                height: logo.height * 0.75, // pixels to points
                width: logo.width * 0.75, // pixels to points
                align: 'center',
              });
            }
            doc.text(fillPlaceholders(data.title, data.input, formattedDate), {
              font: HelveticaBold,
              fontSize: 48,
              textAlign: 'center',
            });
            doc.text(fillPlaceholders(data.subtitle, data.input, formattedDate), {
              font: HelveticaBold,
              fontSize: 24,
              textAlign: 'center',
            });
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
          step('Génération de la table des matières', () => {
            if (data.cover) doc.pageBreak();
            doc.text();
            doc.destination('%changelog%');
            if (data.documentOutline) doc.outline('Journal des modifications', '%changelog%');
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
            header.cell('Document');
            header.cell('Page', { textAlign: 'right' });
            const addRow = (name, destination, page) => {
              const row = table.row();
              row.cell().text(name, { goTo: destination });
              row.cell().text(page, { goTo: destination, textAlign: 'right' });
            };
          }, send);
        }

        // Changelog
        if (data.changelog) {
          step('Génération du journal des modifications', () => {
            if (data.cover || data.toc) doc.pageBreak();
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
            const files = subTree
              .filter(item => (item.type === 'file'))
              .sort((a, b) => {
                if (a.lastModified.toISOString() < b.lastModified.toISOString()) return -1;
                if (a.lastModified.toISOString() > b.lastModified.toISOString()) return 1;
                return 0;
              });
            for (let i = 0; i < files.length; i += 1) {
              const item = files[i];
              addRow(
                item.name.substring(0, item.name.length - 4),
                item.name,
                item.lastModified.toISOString().substr(0, 10),
              );
            }
          }, send);
        }

        // merge files
        for (let i = 0; i < subTree.length; i += 1) {
          const item = subTree[i];
          const foldersBuffer = [];
          // eslint-disable-next-line no-await-in-loop, no-loop-func
          await stepAsync(`Fusion de l'élément ${item.name}`, async () => {
            if (item.type === 'file') {
              const file = await fs.readFile(item.fullPath)
                // eslint-disable-next-line no-console
                .catch(e => console.log(`aggregate file > fs.readFile: ${e.message}`));
              const pdfFile = new pdf.ExternalDocument(file);
              doc.setTemplate(pdfFile);
              doc.text();
              while (foldersBuffer.length !== 0) {
                const folderItem = foldersBuffer.pop();
                doc.destination(folderItem.name);
                if (data.documentOutline) {
                  doc.outline(
                    folderItem.name.split('/').pop(),
                    folderItem.name,
                    folderItem.parentDir,
                  );
                }
              }
              doc.destination(item.name);
              if (data.documentOutline) {
                doc.outline(item.name.substring(0, item.name.length - 4), item.name, item.parentDir);
              }
              for (let j = 2; j <= pdfFile.pageCount; j += 1) {
                const otherPage = new pdf.Document({ font: Helvetica, fontSize: 11 });
                if (isTest) {
                  otherPage.info.id = '__MOCKED_ID__';
                  otherPage.info.producer = '__MOCKED_PRODUCER__';
                  otherPage.info.creationDate = new Date(0, 0, 0, 0, 0, 0, 0);
                }
                otherPage.addPageOf(j, pdfFile);
                const otherPageDoc = await otherPage.asBuffer(); // eslint-disable-line no-await-in-loop
                const extOtherPage = new pdf.ExternalDocument(otherPageDoc);
                doc.setTemplate(extOtherPage);
                doc.text();
              }
              doc.setTemplate(pdfEmpty);
            } else {
              foldersBuffer.push(item);
            }
          }, send);
        }

        // save the file into the output folder
        const filename = fillPlaceholders(data.filename, data.input, formattedDate);
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
      } else {
        step(`Le dossier source est vide : ${folder}`, () => true, send);
      }
    }));

    // Final step
    step('Traitement terminé', () => true, send);
  } catch (e) {
    console.log(`pdfAggregator: ${e.message}`); // eslint-disable-line no-console
    step(`Le traitement a échoué: ${e.message}`, () => true, send, true, false);
  }

  // Remove the empty template
  await stepAsync('Suppression du modèle de page vierge', async () => {
    await fs.remove(`${data.output}/_blank.pdf`)
      .catch(e => console.log(`aggregate > fs.remove: ${e.message}`)); // eslint-disable-line no-console
  }, send, false, true);
};

module.exports = {
  crawlFolder,
  getFoldersToAggregate,
  getSubTree,
  stripEmptyFolders,
  makeEmptyPdf,
  deduplicatePdfPath,
  fillPlaceholders,
  aggregate,
};
