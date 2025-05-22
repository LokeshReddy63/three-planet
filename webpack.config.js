const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production", // For optimized Vercel build
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|hdr)$/i,
        type: "asset/resource", // includes .hdr support
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // ensure correct path on Vercel
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // you'll need this HTML file
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "public/static"), to: "static" },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
  },
};
