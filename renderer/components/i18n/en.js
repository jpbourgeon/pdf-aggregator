import React from 'react';
import app from '../../../package.json';

export default {
  // About
  'about.app.name': app.name,
  'about.app.description': 'A desktop app that aggregates all PDF files from a folder tree into a single PDF',
  'about.app.version': ` - ${app.version}`,
  'about.app.github.label': 'Github repository',
  'about.app.github.url': 'https://github.com/jpbourgeon/pdf-aggregator',
  'about.app.releases.label': 'Releases',
  'about.app.releases.url': 'https://github.com/jpbourgeon/pdf-aggregator/releases',
  'about.app.license.label': 'License',
  'about.app.license.url': 'https://github.com/jpbourgeon/pdf-aggregator/blob/master/license.txt',
  'about.app.help.label': 'Help',
  'about.app.help.url': 'https://github.com/jpbourgeon/pdf-aggregator/blob/master/README.md',
  'about.author.label': 'Author',
  'about.author.url': 'http://linkedin.com/in/jpbourgeon',
  'about.close': 'Close',
  // Start
  'start.state.defaults.filename': '%inputfolder%_%isodate%',
  'start.state.defaults.coverpageFooter': '%isodate%',
  'start.title': 'Parameters',
  'start.messages.level': <span>0 = root level</span>,
  'start.messages.depth': <span>0 = unlimited depth</span>,
  'start.messages.options': (
    <span>
      <strong>Options</strong><br />
      %isodate% : ISO-8601 formatted date (YYYY-MM-DD)<br />
      %inputfolder% : input folder&apos;s name<br />
      %line% : go to the line
    </span>
  ),
  'start.messages.coverpage': (
    <span>
      <strong>Important</strong><br />
    Place a file <em>_cover.pdf</em> in the input folder.<br />
    The first page of this document will be used as the cover page.
    </span>
  ),
  'start.sourceFolder.inputLabel': 'Source folder',
  'start.sourceFolder.ariaLabel': 'Choose a source folder',
  'start.sourceFolder.buttonLabel': 'OK',
  'start.level.label': 'Level',
  'start.depth.label': 'Depth',
  'start.outputFolder.inputLabel': 'Output folder',
  'start.outputFolder.ariaLabel': 'Choose an output folder',
  'start.outputFolder.buttonLabel': 'OK',
  'start.filename.label': 'Output file(s) name(s)',
  'start.coverpage.label': 'Cover page',
  'start.coverpageFooter.label': 'Footer of the cover page',
  'start.changelog.label': 'Change log',
  'start.documentOutline.label': 'Document outline',
  'start.tableOfContents.label': 'Table of Contents',
  'start.pageNumbers.label': 'Page numbers',
  'start.submit.label': 'Submit',
  'start.cancel.label': 'Cancel',
  // Result
  'result.title.inProgress.label': 'Job in progress',
  'result.title.completed.label': 'Job completed',
  'result.cancelButton.label': 'Cancel',
  'result.openButton.label': 'Open the target folder',
  'result.newButton.label': 'New job',
  'result.operationsLog.title.label': 'Operations log',
  'result.operationsLog.saveButton.label': 'Save',
  'result.operationsLog.save.onSuccess.label': 'The log has been saved in the target folder',
  'result.operationsLog.save.onError.label': 'Error: The log has not been saved',
  // Aggregator
  'aggregator.job.init': 'Initialization',
};
