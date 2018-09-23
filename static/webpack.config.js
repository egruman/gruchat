const webpack = require('webpack'),
      path = require('path'),
      SRC_DIR = path.resolve(__dirname, 'src')
      BUILD_DIR = path.resolve(__dirname, 'transpiled'),

module.exports = {
  entry: {
    index: path.resolve(SRC_DIR, 'index.jsx')
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: [ '.js', '.jsx', '.json', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: SRC_DIR,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader'
      }, {
        test: /\.css$/,
        loader: 'css-loader',
        query: {
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]'
        }
      }
    ]
  }
}