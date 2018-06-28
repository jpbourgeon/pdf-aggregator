const debug = require('debug')('app:utils/pdfaggregator.js');
const fs = require('fs-extra');
const pdf = require('pdfjs');
const Helvetica = require('pdfjs/font/Helvetica');
const HelveticaBold = require('pdfjs/font/Helvetica-Bold');
const { getTree } = require('./gettree');
const { deduplicatePath } = require('./deduplicatepath.js');
const t9n = require('../i18n/t9n');


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

const stepAsync = async (taskName, task, send, errorIsFatal = false, isLast = false,
  force = false) => {
  try {
    setCurrentTask(send, taskName);
    if (jobIsTerminated && !force) throw new Error('aggregator.errors.canceled');
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
    if (jobIsTerminated && !force) throw new Error('aggregator.errors.canceled');
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
  if (files.length === 0) throw new Error('aggregator.errors.noFilesToAggregate');
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
  if (itemsNumber < 0 || Number.isNaN(parseInt(itemsNumber, 10))) {
    throw new Error('aggregator.errors.invalidItemsNumber');
  }
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

const findParentOutlineId = (tree, search, start = undefined, skipRoot = 0) => {
  const _start = (start) || tree.length - 1;
  for (let i = _start; i >= 0; i -= 1) {
    if (tree[i].fullPath.substr(skipRoot) === search) return tree[i].outlineId;
  }
  return undefined;
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
    step(t9n('aggregator.job.start', data.loadedLanguage), () => true, send);

    // Read the input tree
    let tree;
    await stepAsync(t9n('aggregator.job.readInputFolder', data.loadedLanguage), async () => {
      tree = await crawlFolder(data.input).catch(e => debug(e));
    }, send, true);

    // Prepare the empty template
    let pdfEmpty;
    await stepAsync(t9n('aggregator.job.createEmptyTemplate', data.loadedLanguage), async () => {
      await makeEmptyPdf(data.output).catch(e => debug(e));
      const empty = await fs.readFile(`${data.output}/_blank.pdf`).catch(e => debug(e));
      pdfEmpty = new pdf.ExternalDocument(empty);
    }, send, true);

    // Get the list of folders to aggregate
    let foldersToAggregate = [];
    step(
      t9n('aggregator.job.retrieveFoldersToMerge', data.loadedLanguage),
      () => { foldersToAggregate = getFoldersToAggregate(tree, data); },
      send,
      true,
    );

    // Process each folder that will be aggregated
    if (foldersToAggregate.length !== 0) {
      await Promise.all(foldersToAggregate.map(async (folder) => {
      // Prepare the input folder
        let subTree;
        step(`${t9n('aggregator.job.prepareInputFolder', data.loadedLanguage)} ${folder}`, () => {
          const maxDepth = (data.depth <= 0) ? Infinity : data.level + data.depth;
          subTree = getSubTree(tree, folder, maxDepth, isTest);
          subTree = stripEmptyFolders(subTree);
          subTree = subTree
            .filter(item => (item.name.toLowerCase() !== '_blank.pdf' && item.name.toLowerCase() !== '_cover.pdf'));
        }, send);

        if (subTree.length !== 0) {
          const doc = new pdf.Document({ font: Helvetica, fontSize: 11 });

          // Cover page
          if (data.coverpage) {
            const coverExists = await fs.pathExists(`${data.input}/_cover.pdf`)
              .catch((e) => {
                debug(e);
                return false;
              });
            if (coverExists) {
              await stepAsync(t9n('aggregator.job.mergeCoverpage', data.loadedLanguage), async () => {
                const footer = doc.footer();
                if (data.coverpageFooter) {
                  footer.text(fillPlaceholders(data.coverpageFooter, data.input, currentDate), { textAlign: 'center' });
                }
                const coverFile = await fs.readFile(`${data.input}/_cover.pdf`).catch(e => debug(e));
                const cover = new pdf.ExternalDocument(coverFile);
                doc.setTemplate(cover);
                doc.text();
              }, send);
            } else {
              addLogEntry(
                send,
                t9n('aggregator.errors.noCoverpage', data.loadedLanguage),
                true,
              );
            }
          }

          // Page numbers
          const footer = doc.footer();
          if (data.pageNumbers) {
            step(t9n('aggregator.job.numberPages', data.loadedLanguage), () => {
              footer.pageNumber(
                (curr, total) => (`${curr} / ${total}`),
                { textAlign: 'center' },
              );
            }, send);
          }

          // Generate the table of content (if asked: don't forget to add the bookmark)
          if (data.toc) {
            await stepAsync(t9n('aggregator.job.addToc', data.loadedLanguage), async () => {
              doc.setTemplate(pdfEmpty);
              doc.text();
              doc.destination('__toc__');
              if (data.documentOutline) {
                doc.outline(t9n('aggregator.result.toc.label', data.loadedLanguage), '__toc__');
              }
              doc.text(`${t9n('aggregator.result.toc.label', data.loadedLanguage)}\n\n`, {
                // font: HelveticaBold,
                fontSize: 18,
              });
              const table = doc.table({
                widths: [null, 3 * pdf.cm],
                borderHorizontalWidths: i => ((i < 2) ? 1 : 0.1),
                padding: 5,
              });
              const th = table.row({
                font: HelveticaBold,
                marginTop: 5,
                backgroundColor: 0x666666,
                color: 0xffffff,
              });
              th.cell(t9n('aggregator.result.toc.content.label', data.loadedLanguage));
              th.cell(t9n('aggregator.result.toc.page.label', data.loadedLanguage), { textAlign: 'right' });
              const addRow = (name, destination, page = '') => {
                const tr = table.row();
                tr.cell().text(name, { goTo: destination });
                tr.cell().text(page, { goTo: destination, textAlign: 'right' });
              };
              let pageNumber = 1;
              if (data.coverpage) pageNumber += 1;
              pageNumber += calculatePages(subTree.length);
              if (data.changelog) {
                addRow(
                  t9n('aggregator.result.changelog.label', data.loadedLanguage),
                  '__changelog__',
                  pageNumber.toString(),
                );
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
            }, send);
          }

          // Changelog
          if (data.changelog) {
            step(t9n('aggregator.job.addChangelog', data.loadedLanguage), () => {
              doc.setTemplate(pdfEmpty);
              doc.text();
              doc.destination('__changelog__');
              if (data.documentOutline) {
                doc.outline(
                  t9n('aggregator.result.changelog.label', data.loadedLanguage),
                  '__changelog__',
                );
              }
              doc.text(`${t9n('aggregator.result.changelog.label', data.loadedLanguage)}\n\n`, {
                font: HelveticaBold,
                fontSize: 18,
              });
              const table = doc.table({
                widths: [null, 3 * pdf.cm],
                borderHorizontalWidths: i => ((i < 2) ? 1 : 0.1),
                padding: 5,
              });
              const th = table.row({
                font: HelveticaBold,
                marginTop: 5,
                backgroundColor: '0x666666',
                color: '0xffffff',
              });
              th.cell(t9n('aggregator.result.changelog.document.label', data.loadedLanguage));
              th.cell(t9n('aggregator.result.changelog.date.label', data.loadedLanguage), { textAlign: 'right' });
              const addRow = (name, destination, modified) => {
                const tr = table.row();
                tr.cell().text(name, { goTo: destination });
                tr.cell().text(modified, { goTo: destination, textAlign: 'right' });
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
            await stepAsync(`${t9n('aggregator.job.mergeItem', data.loadedLanguage)} ${item.name}`, async () => {
              if (item.type === 'file') {
                const file = await fs.readFile(item.fullPath).catch(e => debug(e));
                const pdfFile = new pdf.ExternalDocument(file);
                doc.setTemplate(pdfFile);
                doc.text();
                while (foldersBuffer.length !== 0) {
                  const folderItem = foldersBuffer.shift();
                  const folderPath = folderItem[0].fullPath.substr(data.input.length + 1);
                  let folderParent = folderPath.split('/');
                  folderParent.pop();
                  folderParent = folderParent.join('/');
                  doc.destination(folderPath);
                  if (data.documentOutline) {
                    subTree[folderItem[1]].outlineId = doc.outline(
                      folderItem[0].name,
                      folderPath,
                      findParentOutlineId(subTree, folderParent, folderItem[1], data.input.length + 1),
                    );
                  }
                }
                let itemParent = item.fullPath.substr(data.input.length + 1).split('/');
                itemParent.pop();
                itemParent = itemParent.join('/');
                doc.destination(item.fullPath.substr(data.input.length + 1));
                if (data.documentOutline) {
                  doc.outline(
                    item.name.substr(0, item.name.length - 4),
                    item.fullPath.substr(data.input.length + 1),
                    findParentOutlineId(subTree, itemParent, i, data.input.length + 1),
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
                foldersBuffer.push([item, i]);
              }
            }, send);
          }

          // save the file into the output folder
          const filename = fillPlaceholders(data.filename, data.input, currentDate);
          await stepAsync(
            `${t9n('aggregator.job.mergeItem', data.loadedLanguage)} ${filename}.pdf`,
            () => new Promise(async (resolve, reject) => {
              const path = await deduplicatePath(`${data.output}/${filename}.pdf`, '.pdf').catch(e => debug(e));
              const write = fs.createWriteStream(path);
              doc.pipe(write);
              await doc.end().catch(e => debug(e));
              write.on('finish', resolve);
              write.on('error', reject);
            }),
            send,
          );
        } else {
          step(`${t9n('aggregator.job.mergeItem', data.loadedLanguage)} ${folder}`, () => true, send);
        }
      }));
      // Final step
      step(t9n('aggregator.job.end', data.loadedLanguage), () => true, send);
    } else {
      step(t9n('aggregator.job.end.nothingToMerge', data.loadedLanguage), () => true, send);
    }
  } catch (e) {
    debug(e);
    addLogEntry(send, `${t9n('aggregator.errors.general')} ${e.message}`, true, false);
  }

  // Remove the empty template -- by force if the job has been terminated manually
  await stepAsync(t9n('aggregator.job.end.unlinkEmptyTemplate', data.loadedLanguage), async () => {
    await fs.remove(`${data.output}/_blank.pdf`).catch(e => debug(e));
  }, send, false, true, true);
};

module.exports = {
  crawlFolder,
  getFoldersToAggregate,
  getSubTree,
  stripEmptyFolders,
  fillPlaceholders,
  calculatePages,
  countPages,
  findParentOutlineId,
  makeEmptyPdf,
  aggregate,
  terminateJob,
  step,
  stepAsync,
};
