const path = require('path');
const nodeExternals = require('webpack-node-externals');

const entry = process.env.ENTRY || './server/index.js';
const output_path = process.env.OUTPUT_PATH || 'server-build';
const output_filename = process.env.OUTPUT_FILENAME || 'index.js';

module.exports = {
  entry,
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(output_path),
    filename: output_filename
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /(\.css$|\.jpg|\.png|\.webp)/,
        loader: "ignore-loader"
      }
    ]
  },
  watchOptions: {
    ignored: ["**/node_modules", "**/uploads"],
  }
};