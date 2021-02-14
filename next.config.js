// Core
const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  // These modules doesn't support IE11:
  'logform',
  'winston-transport',
  'async',
  'is-stream',
]);

module.exports = withPlugins([
  [ withTM, {} ]
], {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      return {
        ...config,
        node: {
          fs: 'empty'
        }
      }
    }

    return config;
  }
});
