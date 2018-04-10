const { dialog } = require('electron');

const selectDirectory = (win, options) => {
  const filePath = dialog.showOpenDialog(win, options);

  if (filePath) {
    return filePath[0];
  }

  return '';
};

module.exports = selectDirectory;
