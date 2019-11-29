const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  entry: './tests/all-tests-entry.js',
  target: 'node',
  externals: [nodeExternals()],
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
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  watchOptions: {
    ignored: /node_modules/
  },
  output: {
    filename: 'aergia-test-bundle.js',
    sourceMapFilename: 'aergia-test-bundle.js.map',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs'
  }
};
