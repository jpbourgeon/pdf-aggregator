/* eslint-disable no-param-reassign */
module.exports = {
  webpack(config) {
    config.target = 'electron-renderer';

    // Hide the "dependency is a critical expression" warnings
    // There's no need to care about them
    config.module.exprContextCritical = false;

    // Prevent huge sourcemaps from being created,
    // makes the devtools much faster
    config.devtool = false;

    // Make `react-dom/server` work
    if (config.resolve.alias) {
      delete config.resolve.alias.react;
      delete config.resolve.alias['react-dom'];
    }

    return config;
  },
  exportPathMap() {
    return {
      '/start': { page: '/start' },
    };
  },
};
