const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const convert = require('koa-connect');
const history = require('connect-history-api-fallback');

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  entry: { app: './app.js' },
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: './index.ejs',
    }),
  ],
  serve: {
    host: process.env.MANIFOLD_DASHBOARD_URL || '0.0.0.0',
    port: 3000,
    content: [path.resolve(__dirname, '..', 'public')],
    dev: { publicPath: '/' },
    add: app => {
      app.use(convert(history({})));
    },
  },
};
