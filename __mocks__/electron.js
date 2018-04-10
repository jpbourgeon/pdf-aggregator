const electron = {
  remote: {
    require: (module) => {
      let mock;
      if (module === './utils/dialog') {
        mock = jest.fn();
      }
      if (module === './utils/database') {
        mock = {
          getState: () => jest.fn().mockReturnValue({}),
          setState: jest.fn().mockReturnThis(),
          write: () => jest.fn(),
        };
      }
      return mock;
    },
    getCurrentWindow: jest.fn(),
  },
  dialog: {
    showOpenDialog: jest.fn(),
  },
};

module.exports = electron;
