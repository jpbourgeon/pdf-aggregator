// Native
const { format } = require('url');

// Packages
const { BrowserWindow, app } = require('electron');
const isDev = require('electron-is-dev');
const prepareNext = require('electron-next');
const { resolve } = require('app-root-path');
const { shell, ipcMain } = require('electron');
const debug = require('debug')('app:main/index.js');
const { terminateJob } = require('./utils/pdfaggregator');

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer').catch(e => debug(e));
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    minWidth: 800,
  });

  const devPath = 'http://localhost:8000/start';

  const prodPath = format({
    pathname: resolve('renderer/out/start/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  let url;
  if (isDev) {
    url = devPath;
    mainWindow.webContents.openDevTools();
  } else {
    url = prodPath;
    mainWindow.setMenu(null);
    mainWindow.setResizable(true);
  }

  // Catch external actions and open them outside of electron
  const handleRedirect = (e, href) => {
    if (href !== mainWindow.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(href);
    }
  };
  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

  // Catch interruption calls and pass them to the PDFAggregator functions
  ipcMain.on('cancel-job', () => {
    debug('The user asked the termination of the current job');
    terminateJob();
  });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);
