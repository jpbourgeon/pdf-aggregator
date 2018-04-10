const selectDirectory = require('./dialog');
const { dialog } = require('electron');

describe.only('Given the selectDirectory function', () => {
  it('should open electron\'s dialog window', () => {
    selectDirectory(jest.fn(), {});
    expect(dialog.showOpenDialog).toHaveBeenCalled();
  });

  it('should return the file path string if a folder has been selected', () => {
    dialog.showOpenDialog.mockReturnValueOnce(['/path/']);
    const result = selectDirectory(jest.fn(), {});
    expect(result).toBe('/path/');
  });

  it('should return an empty string if no folder has been selected', () => {
    dialog.showOpenDialog.mockReturnValueOnce(undefined);
    const result = selectDirectory(jest.fn(), {});
    expect(result).toBe('');
  });
});
