var webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin"),
    MiniCssExtractPlugin = require('mini-css-extract-plugin');

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets." + env.NODE_ENV + ".js"));

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    index: path.join(__dirname, "src", "", "index.js"),
    // options: path.join(__dirname, "src", "js", "options.js"),
    // background: path.join(__dirname, "src", "js", "background.js"),
    // myContentScript: path.join(__dirname, "src", "js", "myContentScript.js")
  },
  output: {
    publicPath: '',
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    alias: alias,
    extensions: fileExtensions.map(extension => ("." + extension)).concat([".jsx", ".js", ".css"])
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin([
        "src/manifest.json",
      {
        from: "src/css",
        to: 'css/'
      },
      {
        from: "src/_locales",
        to: '_locales/'
      },
      {
        from: "src/images",
        to: 'images/'
      },
      {
        from: "src/js",
        to: 'js/'
      }
    ], { copyUnmodified: true }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      filename: "index.html",
      chunks: ["index"]
    }),
    new WriteFilePlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ]
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
}

module.exports = options;
