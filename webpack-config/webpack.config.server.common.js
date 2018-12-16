const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');

const constants = require('./constants');

module.exports = {
    name: 'server',
    entry: './src/server.js',
    output: {
        path: path.resolve(constants.dirDist),
        filename: 'server.js'
    },
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: constants.filesVue,
                loader: 'vue-loader'
            },
            {
                test: constants.filesJs,
                // include: path.resolve(constants.dirSource),
                // exclude: constants.fileToExcludeFromBabel,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        'node': 'current'
                                    },
                                    spec: false,
                                    loose: false,
                                    modules: 'auto',
                                    debug: true,
                                    useBuiltIns: false,
                                    forceAllTransforms: false
                                }
                            ]
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true}],
                            ['@babel/plugin-proposal-decorators', {legacy: true}],
                            ['@babel/plugin-proposal-class-properties', {loose: false}],
                            '@babel/plugin-syntax-dynamic-import'/*,
                            ['@babel/plugin-transform-runtime', {corejs: false, helpers: true, regenerator: true, useESModules: true}]*/
                        ],
                        cacheDirectory: '.babel-cache-server'
                    }
                }
            },
            {
                // ignore styles in server build
                test: constants.filesCss,
                use: [
                    'null-loader'
                    // 'vue-style-loader',
                    // 'css-loader'
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
                // ignore styles in server build
                test: constants.filesLess,
                use: [
                    'null-loader'
                    // 'vue-style-loader',
                    // 'css-loader',
                    // 'less-loader'
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
                            outputPath: path.join(constants.dirWWW, 'images/'),
                            publicPath: 'assets/images/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            constants.dirDist
        ], {
            verbose: true,
            root: path.resolve(),
            exclude: [
                constants.dirWWW
            ]
        }),
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            // in back use direct calls
            'jb-resources': 'resources-back.js'
        },
        modules: [
            path.resolve(constants.dirIsomorphicResources),
            'node_modules'
        ]
    }
};