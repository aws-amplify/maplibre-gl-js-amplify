/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./integ-test/index.js",
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "test-dist"),
  },
  plugins: [new HtmlWebpackPlugin(), new NodePolyfillPlugin()],
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
