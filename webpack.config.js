const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./app.js",
  output: {
    path: __dirname + "/dist",
    filename: "AnalyticsNotebook.js",
    library: "AnalyticsNotebook",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "AnalyticsNotebook.html",
    }),
  ],
};
