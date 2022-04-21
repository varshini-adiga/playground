const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require("path");

const publicPath = process.env.PUBLIC_PATH || '/';
const publicBuild = 'build';
const devServerPort = 3000;

const getFileLoaders = options => {
  return [
    {
      loader: require.resolve('url-loader'),
      options: {
        fallback: 'file-loader',
        publicPath,
        limit: 10240,
        ...options
      }
    }
  ];
};

const webpackConfig = {
  target: 'web',
  devtool: 'source-map',
  context: path.join(__dirname, "client"),
  entry: './index.js',
  resolve: {
    extensions: ['.jsx', '.js']
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            configFile: true
          }
        }
      },
      {
        test:/\.css$/,
        use:['style-loader', 'css-loader']
      },
      {
        test: /\.(eot|ttf|woff2?)(\?.*)?$/i,
        use: getFileLoaders({
          name: `${publicBuild}/[name].[ext]`
        })
      },
      {
        test: /\.d\.ts$/i,
        use: "raw-loader",
      },
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      process: 'process',
    }),
    new MonacoEditorWebpackPlugin({
      languages: [ "javascript", "typescript", "css", "html", "json" ]
    }),
    new HtmlWebpackPlugin(
      Object.assign(
        {
          title: process.env.APP_NAME || 'React App',
          template: path.join(__dirname, "public", "index.html"),
          scriptLoading: 'defer'
        }
      )
    )
  ],
  devServer: {
    port: devServerPort,
    host: 'localhost',
    stats: 'minimal',
    compress: true,
    hot: true,
    open: true,
    historyApiFallback: true,
    publicPath,
    contentBase: path.join(__dirname, "public"),
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 9999}`
    }
  }
};

module.exports = webpackConfig;
