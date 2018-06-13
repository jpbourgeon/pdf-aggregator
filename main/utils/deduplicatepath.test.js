const debug = require('debug')('app:utils/deduplicatepath.test.js');
const { deduplicatePath } = require('./deduplicatepath.js');

describe('the async deduplicateJsonPath function', () => {
  let nextIteration;
  let expectedLoops;

  const setupPathExistsMock = (count) => {
    nextIteration = 0;
    expectedLoops = count;
  };

  const mockPathExists = () => new Promise((resolve) => {
    const currentIteration = nextIteration;
    nextIteration += 1;
    if (currentIteration >= expectedLoops) {
      resolve(false);
    } else {
      resolve(true);
    }
  });

  it('should return path.ext if the file doesn\'t exists', async () => {
    setupPathExistsMock(0);
    expect.assertions(1);
    const result = await deduplicatePath('path.ext', '.ext', mockPathExists).catch(e => debug(e));
    expect(result).toBe('path.ext');
  });

  it('should return path_1.ext if path.ext already exists', async () => {
    setupPathExistsMock(1);
    expect.assertions(1);
    const result = await deduplicatePath('path.ext', '.ext', mockPathExists).catch(e => debug(e));
    expect(result).toBe('path_1.ext');
  });

  it('should return path_3.ext if the 3 previous files already exist', async () => {
    setupPathExistsMock(3);
    expect.assertions(1);
    const result = await deduplicatePath('path.ext', '.ext', mockPathExists).catch(e => debug(e));
    expect(result).toBe('path_3.ext');
  });
});
