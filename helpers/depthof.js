const depthOf = (target) => {
  let level = 1;
  Object.keys(target).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      if (typeof target[key] === 'object') {
        const depth = depthOf(target[key]) + 1;
        level = Math.max(depth, level);
      }
    }
  });
  return level;
};

module.exports = depthOf;
