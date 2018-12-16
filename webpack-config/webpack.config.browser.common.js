const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const constants = require('./constants');

module.exports = {
    // front
    name: 'browser',
    entry: {
        // admin web app
        'adm': constants.entryAppAdmin,
        // public web app
        'pub-ssr': constants.entryAppPub,
        // login page
        'login': constants.entryLogin
    },
    output: {
        path: path.resolve(constants.dirDist, constants.dirWWW),
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
        publicPath: constants.dirWWWAlias
    },
    target: 'web',
    plugins: [
        new CleanWebpackPlugin([
            // clear dist/www
            path.join(constants.dirDist, constants.dirWWW)
        ], {
            verbose:  true,
            root: path.resolve()
        }),
        new CopyWebpackPlugin([
            {
                // copy icon(s) to www
                from: path.join(constants.dirSource, '/*.ico'),
                flatten: true
            }
        ]),
        // to load none-js depenencies in .vue modules
        new VueLoaderPlugin(),
        // to place css files as separate resource rather than inject in js
        new MiniCssExtractPlugin(),
        // to inject assets in admin app
        new HtmlWebpackPlugin({
            filename: '../views/admin/index.pug',
            template: 'src/views/admin/index.pug',
            inject: true,
            minify: false,
            cache: true,
            showErrors: true,
            chunks: [
                'vendors~adm',
                'common',
                'adm'
            ],
            filetype: 'pug'
        }),
        // to inject assets in login page
        new HtmlWebpackPlugin({
            filename: '../views/admin/login.pug',
            template: 'src/views/admin/login.pug',
            inject: true,
            minify: false,
            cache: true,
            showErrors: true,
            chunks: [
                'vendors~login',
               'login'
            ],
            filetype: 'pug'
        }),
        // to inject assets in public app
        // use plain html
        // later plain html will pass throw vue server renderer
        new HtmlWebpackPlugin({
            filename: '../views/pub/pub-ssr-template.html',
            template: 'src/views/pub/pub-ssr-template.html',
            inject: true,
            minify: false,
            cache: true,
            showErrors: true,
            chunks: [
                'vendors~pub-ssr',
                'common',
                'pub-ssr'
            ],
        }),
        // to learn HtmlWebpackPlugin process pug template
        new HtmlWebpackPugPlugin()
    ],
    module: {
        rules: [
            {
                // vue modules
                test: constants.filesVue,
                loader: 'vue-loader'
            },
            {
                test: constants.filesPug,
                oneOf: [
                    // это применяется к `<template lang="pug">` в компонентах Vue
                    {
                        resourceQuery: constants.containsVue,
                        use: [
                            'pug-plain-loader'
                        ]
                    },
                    // to process pug in HtmlWebpackPugPlugin
                    {
                        resourceQuery: /\.js$/,
                        use: [
                            'pug-loader'
                        ]
                    }
                ]
            },
            {
                // fonts dependencies
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            },
            {
                // inject images as url
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]-[hash].[ext]',
                            outputPath: 'images/'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            // in front use rpc calls
            'jb-resources': 'resources-front.js'
        },
        modules: [
            path.resolve(constants.dirIsomorphicResources),
            'node_modules'
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                common: {
                    name: 'common',
                    chunks: 'initial',
                    minChunks: 2
                },
                manifest: {
                    // TODO may be unessesary
                    name: 'manifest',
                    minChunks: Infinity
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
                // styles: {
                //     name: 'styles',
                //     test: /\.css$/,
                //     chunks: 'all',
                //     enforce: true
                // }
            }
        }
    }
};