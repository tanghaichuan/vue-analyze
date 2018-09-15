var path = require("path");
var webpack = require('webpack');

var config = {
  devtool: 'eval-source-map',
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  devServer: {
    open: true
  }
}

module.exports = config;