const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require("webpack");
const path = require("path");


module.exports = {
    entry: { 
        index: path.resolve(__dirname, "src/client", "index.js") 
    },
    output: {
        path: path.resolve(__dirname, "build")
    },
    module: {
        rules: [
          {
            test: /\.scss$/,
            use: ["style-loader", "css-loader", "sass-loader"]
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ["babel-loader"]
          }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, "public", "index.html")
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: path.resolve(__dirname, './build'),
        open: true,
        hot: true,
        port: 5000
    },
    devtool: 'source-map'
}