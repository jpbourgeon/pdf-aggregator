const { onData, onEnd } = require('./gettree');

describe('The utility library', () => {
  describe('The function on Data', () => {
    let mockEntry;
    beforeEach(() => {
      mockEntry = {
        parentDir: '',
        fullPath: '',
        name: '',
        stat: {
          mtime: jest.fn(),
          isFile: () => jest.fn(),
          isDirectory: () => jest.fn(),
          isBlockDevice: () => jest.fn(),
          isCharacterDevice: () => jest.fn(),
          isSymbolicLink: () => jest.fn(),
          isFIFO: () => jest.fn(),
          isSocket: () => jest.fn(),
        },
      };
    });

    it('should push data from the entry provided into the array provided', () => {
      const arr = [];
      onData(mockEntry, arr);
      expect(arr).toHaveLength(1);
    });

    it('should replace antislashes by slashes on the parentDir', () => {
      const arr = [];
      mockEntry.parentDir = 'pa\\th';
      onData(mockEntry, arr);
      expect(arr[0].parentDir).toBe('pa/th');
    });

    it('should replace antislashes by slashes on the fullPath', () => {
      const arr = [];
      mockEntry.fullPath = 'pa\\th';
      onData(mockEntry, arr);
      expect(arr[0].fullPath).toBe('pa/th');
    });

    it('should set depth to 1 for entries with an empty parentDir', () => {
      const arr = [];
      onData(mockEntry, arr);
      expect(arr[0].depth).toBe(1);
    });

    it('should set depth to 2 for entries with a parentDir of depth 1', () => {
      const arr = [];
      mockEntry.parentDir = 'path';
      onData(mockEntry, arr);
      expect(arr[0].depth).toBe(2);
    });

    it('should set depth to 3 for entries with a parentDir of depth 2', () => {
      const arr = [];
      mockEntry.parentDir = 'pa\\th';
      onData(mockEntry, arr);
      expect(arr[0].depth).toBe(3);
    });
  });

  describe('The function onEnd', () => {
    it('should reject the promise with an error if an error has been encountered', () => {
      const resolve = jest.fn();
      const reject = jest.fn();
      const arr = [];
      const error = new Error('error');
      onEnd(error, arr, resolve, reject);
      expect(reject).toHaveBeenCalledWith(error);
    });

    it('should resolve the promise with an array if no error has been encountered', () => {
      const resolve = jest.fn();
      const reject = jest.fn();
      const arr = [];
      const err = null;
      onEnd(err, arr, resolve, reject);
      expect(resolve).toHaveBeenCalledWith([]);
    });
  });
});
