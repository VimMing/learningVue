var path = require('path')
var webpack = require('webpack')
console.log(path.resolve(__dirname, './node_modules'))
module.exports = {
    entry: './test/unit/specs/index.js',
    output: {
        path: path.resolve(__dirname, './test/unit'),
        filename: 'specs.js'
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, './src')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/, use: 'babel-loader', exclude: [
                    path.resolve(__dirname, './test/unit/'),
                    path.resolve(__dirname, './node_modules/')
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"development"'
            }
        })
    ],
    devServer: {
        contentBase: './test/unit',
        noInfo: true
    },
    devtool: 'source-map'
}