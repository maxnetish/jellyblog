const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const constants = require('./constants');
const path = require('path');
const autoprefixer = require('autoprefixer');

const targetBrowsers = ['last 2 versions'];

module.exports = {
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ],
    module: {
        rules: [
            {
                // transpile js files (include also vue modules)
                test: constants.filesJs,
                include: path.resolve(constants.dirSource),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: targetBrowsers
                                    },
                                    loose: false,
                                    spec: false,
                                    modules: 'auto',
                                    debug: true,
                                    useBuiltIns: false,
                                    forceAllTransforms: false
                                }
                            ]
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true }],
                            // transpile decorators
                            ['@babel/plugin-proposal-decorators', { legacy: true }],
                            // transpile static prop in class declaration (using Object.defineProperty)
                            ['@babel/plugin-proposal-class-properties', { loose : false }],
                            '@babel/plugin-syntax-dynamic-import',
                            // inject babel utils as dependency
                            ['@babel/plugin-transform-runtime', {corejs: false, helpers: true, regenerator: true, useESModules: true}]
                        ],
                        cacheDirectory: '.babel-cache-browser-prod'
                    }
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
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
        minimize: true
    },
    mode: 'production'
};