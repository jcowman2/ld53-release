const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    context: path.resolve(__dirname, "./src"),
    entry: "./ts/index.ts",

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },

    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader"
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },

    resolve: {
        extensions: [".js", ".ts"]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./html/index.html",
            inject: true,
            title: "LD53",
            appMountId: "app",
            filename: "index.html",
            inlineSource: ".(js|css)$",
            minify: false
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "assets",
                    to: "assets"
                }
            ]
        })
    ],

    devServer: {
        static: {
            directory: path.join(__dirname, "dist/")
        },
        port: 5000,
        hot: "only"
    }
};

module.exports = config;
