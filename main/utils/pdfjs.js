/* eslint-disable no-console, import/no-dynamic-require */
const fs = require('fs-extra');
const resolvePath = require('app-root-path').resolve;

const pdf = require('pdfjs');
const Helvetica = require('pdfjs/font/Helvetica');
const HelveticaBold = require('pdfjs/font/Helvetica-Bold');

const testbed = resolvePath('main/utils/__testbed__/pdfjs').replace(/\\/g, '/');

// Empty template
const makeBlank = async () => new Promise(async (resolve, reject) => {
  const doc = new pdf.Document({ font: Helvetica });
  doc.text();
  // Fin
  const write = fs.createWriteStream(`${testbed}/output/_blank.pdf`);
  doc.pipe(write);
  await doc.end()
    .catch(e => console.log(`makeBlank > doc.end: ${e.message}`)); // eslint-disable-line no-console
  write.on('finish', resolve);
  write.on('reject', reject);
});

// make a pdf : pages 3-5
const makeFile1 = async () => new Promise(async (resolve, reject) => {
  const doc = new pdf.Document({ font: Helvetica });
  for (let i = 3; i <= 5; i += 1) {
    doc.text(`Page ${i}`);
    if (i !== 5) doc.pageBreak();
  }

  // Fin
  const write = fs.createWriteStream(`${testbed}/output/file1.pdf`);
  doc.pipe(write);
  await doc.end()
    .catch(e => console.log(`makeFile1 > doc.end: ${e.message}`)); // eslint-disable-line no-console
  write.on('finish', resolve);
  write.on('error', reject);
});

// make a pdf : page 6
const makeFile2 = async () => new Promise(async (resolve, reject) => {
  const doc = new pdf.Document({ font: Helvetica });

  doc.text('Page 6');

  // Fin
  const write = fs.createWriteStream(`${testbed}/output/file2.pdf`);
  doc.pipe(write);
  await doc.end()
    .catch(e => console.log(`makeFile2 > doc.end: ${e.message}`)); // eslint-disable-line no-console
  write.on('finish', resolve);
  write.on('error', reject);
});

// // Main file
const generateMainFile = async () => new Promise(async (resolve, reject) => {
  const empty = await fs.readFile(`${testbed}/output/_blank.pdf`)
    .catch(e => console.log(`generateMainFile empty > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
  const pdfEmpty = new pdf.ExternalDocument(empty);
  const doc = new pdf.Document({ font: Helvetica });
  // Page 1 : cover
  const image = await fs.readFile(`${testbed}/logo.jpg`)
    .catch(e => console.log(`generateMainFile image > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
  const logo = new pdf.Image(image);
  doc.text();
  doc.destination('Première page');
  doc.outline('Première page', 'Première page');
  doc.text('  ', { fontSize: 96, color: '0xffffff' });
  doc.image(logo, {
    height: 96,
    align: 'center',
  });
  doc.text('Titre', { fontSize: 48, textAlign: 'center' });
  doc.text('Sous-titre', { fontSize: 24, textAlign: 'center' });

  // Page 2 : Journal des modifications
  doc.pageBreak();
  doc.destination('Journal des modifications');
  doc.outline('Journal des modifications', 'Journal des modifications');
  doc.outline('Documents fusionnés', 'Page 3');
  doc.text('Journal des modifications', { fontSize: 18, lineHeight: 2.5 });
  doc.text('  ');
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
  addRow('Page 6', 'Page 6', '14/05/2018');
  addRow('Pages 3-5', 'Page 3', '13/05/2018');

  // Fusions : pages 3-5 + destination on the first page
  const file1 = await fs.readFile(`${testbed}/output/file1.pdf`)
    .catch(e => console.log(`generateMainFile file1 > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
  const pdfFile1 = new pdf.ExternalDocument(file1);
  doc.setTemplate(pdfFile1);
  doc.text();
  doc.destination('Page 3');
  doc.outline('Pages 3-5', 'Page 3', 'Documents fusionnés');
  doc.setTemplate(pdfEmpty);
  for (let i = 2; i < pdfFile1.pages.length; i += 1) {
    doc.addPageOf(i, pdfFile1);
  }


  // Fusion : page 6 + destination on the first page
  const file2 = await fs.readFile(`${testbed}/output/file2.pdf`)
    .catch(e => console.log(`generateMainFile file2 > fs.readFile: ${e.message}`)); // eslint-disable-line no-console
  const pdfFile2 = new pdf.ExternalDocument(file2);
  doc.setTemplate(pdfFile2);
  doc.text();
  doc.destination('Page 6');
  doc.outline('Page 6', 'Page 6', 'Documents fusionnés');
  doc.setTemplate(pdfEmpty);

  // Page 7 : with an empty template
  doc.text();
  doc.destination('Dernière page');
  doc.outline('Dernière page', 'Dernière page');
  doc.text('Page 7');

  // Document outline

  // End
  const write = fs.createWriteStream(`${testbed}/output/pdfjs.pdf`);
  doc.pipe(write);
  await doc.end()
    .catch(e => console.log(`generateMainFile doc.end: ${e.message}`)); // eslint-disable-line no-console
  write.on('finish', resolve);
  write.on('error', reject);
});


// Main script
const main = async () => {
  try {
    await fs.emptyDir(`${testbed}/output`);
    await makeBlank();
    await makeFile1();
    await makeFile2();
    await generateMainFile();
    await fs.remove(`${testbed}/output/_blank.pdf`);
  } catch (e) {
    console.log(`main: ${e.message}`); // eslint-disable-line no-console
  }
};

main();
