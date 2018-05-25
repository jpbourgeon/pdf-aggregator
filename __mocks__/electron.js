const electron = {
  remote: {
    require: (module) => {
      // default mock for './utils/dialog' './utils/gettree'
      let mock = jest.fn();
      if (module === './utils/pdfaggregator') {
        mock = {
          aggregate: jest.fn(),
        };
      }
      if (module === './utils/database') {
        mock = {
          getState: jest.fn().mockReturnValue({}),
          setState: jest.fn().mockReturnThis(),
          write: jest.fn(),
        };
      }
      return mock;
    },
    getCurrentWindow: jest.fn(),
    getCurrentWebContents: () => ({
      send: jest.fn(),
    }),
  },
  dialog: {
    showOpenDialog: jest.fn(),
  },
  shell: {
    openItem: jest.fn(),
  },
  ipcRenderer: {
    on: jest.fn(),
  },
};

module.exports = electron;
