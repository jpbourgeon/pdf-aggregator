// Native
const { format } = require('url');

// Packages
const { BrowserWindow, app } = require('electron');
const isDev = require('electron-is-dev');
const prepareNext = require('electron-next');
const { resolve } = require('app-root-path');
const debug = require('debug')('app:main/index.js');

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer').catch(e => debug(e));
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 750,
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

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);
