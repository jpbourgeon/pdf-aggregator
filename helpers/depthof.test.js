const depthOf = require('./depthof');

describe('The helper depthOf', () => {
  it('should return 1 for an empty object', () => {
    const data = {};
    expect(depthOf(data)).toBe(1);
  });

  it('should return 1 for a one level deep object', () => {
    const data = { 1: '' };
    expect(depthOf(data)).toBe(1);
  });

  it('should return 2 for a two level deep object', () => {
    const data = { 1: { 11: '' } };
    expect(depthOf(data)).toBe(2);
  });

  it('should return 2 for a two level deep object with siblings', () => {
    const data = {
      1: {
        11: '',
        12: '',
      },
      2: {
        21: '',
        22: '',
      },
    };
    expect(depthOf(data)).toBe(2);
  });
});
