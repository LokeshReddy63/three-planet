const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: "asset/resource",
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // this is where bundle.js is written on disk
    publicPath: "/", // important for dev server to serve from root
    clean: true,
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"), // serves static files like index.html
      publicPath: "/", // URL prefix
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
  },
  // ...rest of config
};
