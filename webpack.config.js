var webpack = require('webpack');

var appName = 'app';
var outputFile = appName + '.js';

var config = {
  entry: './app/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    publicPath: __dirname + '/dist'
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};

module.exports = config;
