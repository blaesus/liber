const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './web/index.tsx',

    output: {
        path: path.resolve(__dirname, '../../.built/lexis'),
        publicPath: '/',
        filename: 'main.js',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            "node_modules",
            path.join(__dirname, '..', '..'),
        ]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/, loader: 'ts-loader', options: {
                    configFile: path.join(__dirname, './tsconfig.json'),
                },
            },
        ],
    },

    devServer: {
        contentBase: '/',
        port: 9630,
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.html'),
            filename: 'index.html',
            inject:   'body',
        }),
    ]
}
