const webpack = require('webpack');
const constants = require('./constants');
const path = require('path');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const targetBrowsers = ['last 1 Chrome versions', 'last 1 Firefox versions'];

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"',
        })
    ],
    module: {
        rules: [
            {
                // transpile js files (include also vue modules)
                // using all latest features (for debug)
                test: constants.filesJs,
                include: path.resolve(constants.dirSource),
                loader: 'babel-loader',
                query: {
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: {
                                    browsers: targetBrowsers
                                },
                                loose: false
                            }
                        ]
                    ],
                    plugins: [
                        ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true }],
                        // transpile decorators
                        ['@babel/plugin-proposal-decorators', { legacy: true }],
                        // transpile static prop in class declaration (using Object.defineProperty)
                        ['@babel/plugin-proposal-class-properties', { loose : false }],
                        // use async import syntax
                        '@babel/plugin-syntax-dynamic-import'
                    ],
                    cacheDirectory: '.babel-cache'
                }
            },
            {
                test: constants.filesCss,
                use: [
                    // to place css in js bundle
                    // 'vue-style-loader',
                    {
                        // to place css in css files
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer({browsers: targetBrowsers})
                            ],
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: constants.filesLess,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    // 'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer({browsers: targetBrowsers})
                            ],
                            sourceMap: true
                        }
                    },
                    'less-loader'
                ]
            }
        ]
    },
    devtool: 'cheap-module-source-map',
    mode: 'development'
};