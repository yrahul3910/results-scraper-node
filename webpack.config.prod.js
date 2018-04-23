import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WebpackMd5Hash from "webpack-md5-hash";
import ExtractTextPlugin from "extract-text-webpack-plugin";

export default {
    devtool: "source-map",
    entry: [
        path.resolve(__dirname, "src/index")
    ],
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
        filename: "[name].[chunkhash].js"
    },
    plugins: [
        // Generate an external CSS file with a hash in the filename
        new ExtractTextPlugin("[name].[contenthash].css"),

        // Hash the files using MD5 so their names change when the content does
        new WebpackMd5Hash(),

        new HtmlWebpackPlugin({
            template: "src/index.html",
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            inject: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        // Minify JS
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            }
        ]
    }
};
