const path = require('path');
const webpack = require('webpack');
const { getIfUtils } = require('webpack-config-utils');
const nodeExternals = require('webpack-node-externals');

module.exports = (env) => {
  const {
    ifProduction
  } = getIfUtils(env);

  const mode = ifProduction('production', 'development');
  console.log('>>> Aergia Webpack Environment mode: ' + env.mode);

  return {
    mode: mode,
    entry: {
      index: './lib/index.ts'
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          use: 'ts-loader'
        },
        {
          test: /\.json$/,
          use: 'json-loader'
        },
        {
          test: /\.xml$/i,
          use: 'raw-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node',
        raw: true
      })
    ],
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    watchOptions: {
      ignored: /node_modules/
    },
    externals: [nodeExternals()],
    output: {
      libraryTarget: 'commonjs',
      path: path.join(__dirname, 'dist'),
      filename: 'aergia-bundle.js'
    }
  };
};
