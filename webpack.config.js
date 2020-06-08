const path = require("path");

module.exports = {
  entry: ["./src/index.js"],
  output: {
    filename: "onedeck.js",
    path: path.resolve(__dirname),
    library: 'onedeck',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src/"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              ["@babel/plugin-proposal-class-properties", { loose: true }]
            ]
          }
        }
      },
    ]
  }
};