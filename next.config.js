// Core
const withPlugins = require('next-compose-plugins');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanCss = require('clean-css');
const withTM = require('next-transpile-modules')([
  // These modules doesn't support IE11:
  'logform',
  'winston-transport',
  'async',
  'is-stream',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins([
  [ withBundleAnalyzer, {} ],
  [ withTM, {} ]
], {
  webpack: (config, { isServer }) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) { 
      config.optimization.minimizer.push(
        new OptimizeCssAssetsPlugin({
          assetNameRegExp: /\.css$/g,
          cssProcessor: CleanCss,
          cssProcessorOptions: {
            level: {
              1: {
                all: true,
                normalizeUrls: false,
              },
              2: {
                restructureRules: true,
                removeUnusedAtRules: true,
                skipProperties: [ 'border-top', 'border-bottom' ],
              },
            },
          },
          canPrint: true,
        }),
      );
    }

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
