const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const nodeExternals = require('webpack-node-externals');

const srcDir = 'src/backend-api-server';
const distDir = 'dist';
const filesJs = /\.js$/;
const fileTs = /\.tsx?$/;
const filesCss = /\.css$/;
const filesLess = /\.less$/;

module.exports = {
    stats: {
        all: false,
        modules: true,
        maxModules: 0,
        errors: true,
        warnings: true,
        moduleTrace: true,
        errorDetails: true,
        children: false,
        chunks: false,
        assets: true
    },
    mode: 'development',
    entry: {
        server: path.resolve(srcDir, 'server.ts')
    },
    output: {
        path: path.resolve(distDir, 'backend-api-server'),
        filename: '[name].js'
    },
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [],
    module: {
        rules: [
            {
                test: fileTs,
                exclude: /node_modules/,
                loaders: ['ts-loader']
            },
            {
                test: filesJs,
                include: path.resolve(srcDir),
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.tpl.html$/,
                use: 'raw-loader'
            }
        ]
    }
};
