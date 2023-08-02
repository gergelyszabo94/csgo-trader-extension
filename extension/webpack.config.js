const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
  const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];
  const mode = argv.mode || 'development';

  // requited for the chrome manifest.json so the development version gets the same id as the prod
  const chromeExtKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAycJXpmt94FIYH7+OVQswE8ZLWTqmNt3VePgk3IkOVP9QtEvXAcSNvtldqWCH3kFikAJzyeXdUM/puDOwZ4yM0KMgDbhfragLcB9j14VP2i3f3F98utOrRrl0eUAHFJ2fP2yCFbPqOiRZA9JK2jotpHhHib+lO2hLEtAbpnvMhD+TdIuPr33QEJcLkAfqCLZKrFGzqsOV+5NCkLQYfptA9v1KersX8FfFSDRmuzWipfo8EEwJDTcImau4v0YB+lZulHodxv5INt4Xp0Iq/lOgdm/6xUVdhZ3ISyjSvjLWVwstd1UMlLNxyBA9ibpc5UpkXDuPmkd77S2qVyMgsGtEPQIDAQAB';

  // adds extra fields to the chrome and edge versions of the manifest
  const modifyManifest = (buffer) => {
    // copy-webpack-plugin passes a buffer
    const manifest = JSON.parse(buffer.toString());

    manifest.options_page = 'index.html';

    if (mode === 'development') {
      manifest.key = chromeExtKey;
    }

    // pretty print to JSON with two spaces
    return JSON.stringify(manifest, null, 2);
  };

  const pluginsToAlwaysUse = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode,
      DEBUG: false,
    }),
    // copies assets that don't need bundling
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest_ff.json',
        },
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
          transform(content) {
            return modifyManifest(content);
          },
        },
        {
          from: 'src/assets/styles/external/generalCSTStyle.css',
          to: 'css/generalCSTStyle.css',
        },
        {
          from: 'src/assets/_locales',
          to: '_locales/',
        },
        {
          from: 'src/assets/images',
          to: 'images/',
        },
        {
          from: 'src/assets/sounds',
          to: 'sounds/',
        },
        {
          from: 'src/injectToPage',
          to: 'js/injectToPage',
        },
        {
          from: 'src/offScreen/offscreen.html',
          to: 'offScreen/offscreen.html',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
      filename: 'index.html',
      chunks: ['index'],
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new ESLintPlugin({
      cache: false,
      emitWarning: true,
      fix: true,
    }),
  ];

  return {
    mode,
    entry: {
      // the single js bundle used by the single page
      // that is used for the popup, options and bookmarks
      index: path.join(__dirname, 'src', '', 'index.js'),

      // background script
      'js/backgroundScripts/background': path.join(__dirname, 'src', 'backgroundScripts', 'background.js'),

      // offscreen script
      'js/offScreen/offscreen': path.join(__dirname, 'src', 'offScreen', 'offscreen.js'),

      // content scripts that don't run on Steam
      'js/contentScripts/tradersBump': path.join(__dirname, 'src', 'contentScripts', 'tradersBump.js'),
      'js/contentScripts/tradersAutoLogin': path.join(__dirname, 'src', 'contentScripts', 'tradersAutoLogin.js'),

      // contents scripts that run on Steam pages
      'js/contentScripts/steam/apiKey': path.join(__dirname, 'src', 'contentScripts/steam', 'apiKey.js'),
      'js/contentScripts/steam/friends': path.join(__dirname, 'src', 'contentScripts/steam', 'friends.js'),
      'js/contentScripts/steam/group': path.join(__dirname, 'src', 'contentScripts/steam', 'group.js'),
      'js/contentScripts/steam/openIDLogin': path.join(__dirname, 'src', 'contentScripts/steam', 'openIDLogin.js'),
      'js/contentScripts/steam/sharedFile': path.join(__dirname, 'src', 'contentScripts/steam', 'sharedFile.js'),
      'js/contentScripts/steam/webChat': path.join(__dirname, 'src', 'contentScripts/steam', 'webChat.js'),
      'js/contentScripts/steam/inventory': path.join(__dirname, 'src', 'contentScripts/steam', 'inventory.js'),
      'js/contentScripts/steam/marketListing': path.join(__dirname, 'src', 'contentScripts/steam', 'marketListing.js'),
      'js/contentScripts/steam/market': path.join(__dirname, 'src', 'contentScripts/steam', 'market.js'),
      'js/contentScripts/steam/tradeOffer': path.join(__dirname, 'src', 'contentScripts/steam', 'tradeOffer.js'),
      'js/contentScripts/steam/tradeOffers': path.join(__dirname, 'src', 'contentScripts/steam', 'tradeOffers.js'),
      'js/contentScripts/steam/profile': path.join(__dirname, 'src', 'contentScripts/steam', 'profile.js'),
      'js/contentScripts/steam/discussions': path.join(__dirname, 'src', 'contentScripts/steam', 'discussions.js'),
      'js/contentScripts/steam/tradeHistory': path.join(__dirname, 'src', 'contentScripts/steam', 'tradeHistory.js'),
      'js/contentScripts/steam/marketSearch': path.join(__dirname, 'src', 'contentScripts/steam', 'marketSearch.js'),
    },
    output: {
      publicPath: '/',
      path: path.join(__dirname, 'build'),
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: new RegExp(`.(${fileExtensions.join('|')})$`),
          type: 'asset/resource',
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
          options: {
            sources: false,
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: fileExtensions.map((extension) => (`.${extension}`)).concat(['.jsx', '.js', '.css']),
    },
    optimization: {
      minimizer: [new TerserPlugin({ // used to avoid the creation of commments/license txt files
        extractComments: false,
      })],
    },
    devtool: mode ==='production' ? 'source-map' : 'cheap-module-source-map',
    plugins:
      (mode === 'production') ? [...pluginsToAlwaysUse, new CleanWebpackPlugin()] : pluginsToAlwaysUse, // CleanWebpackPlugin only needs to run when it's a production build
    devServer: {
      devMiddleware: {
        writeToDisk: true,
      },
      static: {
        directory: path.join(__dirname, "../build")
      },
    },
  };
};
