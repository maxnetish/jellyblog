const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const constants = require('./constants');

module.exports = {
    // front
    cache: true,
    entry: {
        'adm': constants.entryAppAdmin,
        'pub-ssr': constants.entryAppPub
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
            path.join(constants.dirDist, constants.dirWWW)
        ], {
            verbose:  true,
            root: path.resolve()
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(constants.dirSource, '/*.ico'),
                flatten: true
            }
        ]),
        new VueLoaderPlugin(),
        new VueSSRClientPlugin()
    ],
    module: {
        rules: [
            {
                test: constants.filesVue,
                loader: 'vue-loader'
            },
            {
                test: constants.filesJs,
                include: path.resolve(constants.dirSource),
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: [
                        'transform-object-rest-spread',
                        'transform-decorators-legacy'
                    ],
                    cacheDirectory: '.babel-cache'
                }
            },
            {
                test: constants.filesCss,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
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
                    // это применяется к импортам pug внутри JavaScript
                    {
                        use: [
                            'raw-loader',
                            'pug-plain-loader'
                        ]
                    }
                ]
            },
            {
                test: constants.filesLess,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'less-loader'
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
                    name: 'manifest',
                    minChunks: Infinity
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
};