const webpack = require("webpack");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const fileExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".eot",
  ".otf",
  ".svg",
  ".ttf",
  ".woff",
  ".woff2",
];


// requited for the chrome manifest.json so the development version gets the same id as the prod
const chromeExtKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAycJXpmt94FIYH7+OVQswE8ZLWTqmNt3VePgk3IkOVP9QtEvXAcSNvtldqWCH3kFikAJzyeXdUM/puDOwZ4yM0KMgDbhfragLcB9j14VP2i3f3F98utOrRrl0eUAHFJ2fP2yCFbPqOiRZA9JK2jotpHhHib+lO2hLEtAbpnvMhD+TdIuPr33QEJcLkAfqCLZKrFGzqsOV+5NCkLQYfptA9v1KersX8FfFSDRmuzWipfo8EEwJDTcImau4v0YB+lZulHodxv5INt4Xp0Iq/lOgdm/6xUVdhZ3ISyjSvjLWVwstd1UMlLNxyBA9ibpc5UpkXDuPmkd77S2qVyMgsGtEPQIDAQAB";


module.exports = (env) => {
  
  const mode = env.mode || "development";
  // adds extra fields to the chrome and edge versions of the manifest
  const modifyManifest = (buffer) => {
    // copy-webpack-plugin passes a buffer
    const manifest = JSON.parse(buffer.toString());

    manifest.options_page = "index.html";
    manifest.background.persistent = false;

    if (mode === "development") {
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
          from: "src/manifest.json",
          to: "manifest_ff.json",
        },
        {
          from: "src/manifest.json",
          to: "manifest.json",
          transform(content) {
            return modifyManifest(content);
          },
        },
        {
          from: "src/assets/styles/external/generalCSTStyle.css",
          to: "css/generalCSTStyle.css",
        },
        {
          from: "src/assets/_locales",
          to: "_locales/",
        },
        {
          from: "src/assets/images",
          to: "images/",
        },
        {
          from: "src/assets/sounds",
          to: "sounds/",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      filename: "index.html",
      chunks: ["index"],
    }),
    new WriteFilePlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ];

  return {
    mode,
    entry: {
      // the single js bundle used by the single page
      // that is used for the popup, options and bookmarks
      index: path.join(__dirname, "src", "", "index.ts"),

      // background scripts
      "js/backgroundScripts/background": path.join(
        __dirname,
        "src",
        "backgroundScripts",
        "background.ts"
      ),
      "js/backgroundScripts/messaging": path.join(
        __dirname,
        "src",
        "backgroundScripts",
        "messaging.ts"
      ),

      // content scripts that don't run on Steam
      "js/contentScripts/loungeBump": path.join(
        __dirname,
        "src",
        "contentScripts",
        "loungeBump.ts"
      ),
      "js/contentScripts/tradersBump": path.join(
        __dirname,
        "src",
        "contentScripts",
        "tradersBump.ts"
      ),
      "js/contentScripts/tradersAutoLogin": path.join(
        __dirname,
        "src",
        "contentScripts",
        "tradersAutoLogin.ts"
      ),

      // contents scripts that run on Steam pages
      "js/contentScripts/steam/apiKey": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "apiKey.ts"
      ),
      "js/contentScripts/steam/friends": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "friends.ts"
      ),
      "js/contentScripts/steam/group": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "group.ts"
      ),
      "js/contentScripts/steam/openIDLogin": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "openIDLogin.ts"
      ),
      "js/contentScripts/steam/sharedFile": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "sharedFile.ts"
      ),
      "js/contentScripts/steam/webChat": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "webChat.ts"
      ),
      "js/contentScripts/steam/inventory": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "inventory.ts"
      ),
      "js/contentScripts/steam/marketListing": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "marketListing.ts"
      ),
      "js/contentScripts/steam/market": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "market.ts"
      ),
      "js/contentScripts/steam/tradeOffer": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "tradeOffer.ts"
      ),
      "js/contentScripts/steam/tradeOffers": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "tradeOffers.ts"
      ),
      "js/contentScripts/steam/profile": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "profile.ts"
      ),
      "js/contentScripts/steam/discussions": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "discussions.ts"
      ),
      "js/contentScripts/steam/tradeHistory": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "tradeHistory.ts"
      ),
      "js/contentScripts/steam/marketSearch": path.join(
        __dirname,
        "src",
        "contentScripts/steam",
        "marketSearch.ts"
      ),
    },
    output: {
      publicPath: "/",
      path: path.join(__dirname, "build"),
      filename: "[name].bundle.js",
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            cache: false,
            emitWarning: true,
            fix: true,
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
            "sass-loader",
          ],
        },
        {
          // eslint-disable-next-line no-useless-escape
          test: new RegExp(`\.(${fileExtensions.join("|")})$`),
          loader: "file-loader?name=[name].[ext]",
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          loader: "html-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      modules: [path.resolve(__dirname, "./src"), "node_modules"],
      extensions: fileExtensions,
    },
    devtool: "",
    plugins:
      mode === "production"
        ? [...pluginsToAlwaysUse, new CleanWebpackPlugin()]
        : pluginsToAlwaysUse, // CleanWebpackPlugin only needs to run when it's a production build
    devServer: {
      writeToDisk: true,
      contentBase: path.join(__dirname, "../build"),
    },
  };
};
