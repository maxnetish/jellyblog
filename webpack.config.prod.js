const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const jsFiles = /\.js$/;
const vueComponents = /\.vue$/;
const jsonFiles = /\.json$/;
const fileToExcludeFromBabel = /(node_modules|bower_components)/;

module.exports = [
    {
        // back
        cache: true,
        entry: './src/server.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'server.js'
        },
        target: 'node',
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: vueComponents,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            // vue-loader does not apply babel transpiling as default, so required:
                            js: {
                                loader: 'babel-loader',
                                options: {
                                    presets: [
                                        [
                                            'env',
                                            {
                                                'targets': {
                                                    'node': 'current'
                                                }
                                            }
                                        ]
                                    ],
                                    plugins: [
                                        'transform-decorators-legacy'
                                    ]
                                }
                            }
                        }
                        // other vue-loader options go here
                    }
                },
                {
                    test: jsonFiles,
                    loader: 'json-loader'
                },
                {
                    test: jsFiles,
                    include: path.resolve(__dirname, 'src'),
                    exclude: fileToExcludeFromBabel,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    'env',
                                    {
                                        'targets': {
                                            'node': 'current'
                                        }
                                    }
                                ]
                            ],
                            plugins: [
                                'transform-decorators-legacy'
                            ]
                        }
                    }
                }
            ]
        },
        plugins: [

        ],
        resolve: {
            alias: {
                // in back use direct calls
                'jb-resources': 'resources-back.js'
            },
            modules: [
                path.resolve(__dirname, 'src/resources'),
                'node_modules'
            ]
        }
    },
    {
        // front
        cache: true,
        entry: {
            'adm': './src/admin-client-app.js',
            'common': [
                'core-js/es6/promise',
                'core-js/es6/array',
                'core-js/es6/object',
                'core-js/es6/symbol',
                'superagent'
            ]
        },
        output: {
            path: path.resolve(__dirname, 'build/pub'),
            filename: '[name].js',
            chunkFilename: '[id].chunk.js',
            publicPath: '/assets/'
        },
        target: 'web',
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({name: 'common', filename: 'common.js'}),
            // new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: false,
                compress: {
                    warnings: false
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true
            })
        ],
        module: {
            rules: [
                {
                    test: vueComponents,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            // vue-loader does not apply babel transpiling as default, so required:
                            js: 'babel-loader?presets[]=es2015'
                        }
                        // other vue-loader options go here
                    }
                },
                {
                    test: jsonFiles,
                    loader: 'json-loader'
                },
                {
                    test: jsFiles,
                    include: path.resolve(__dirname, 'src'),
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015'],
                        // plugins: ['transform-runtime'],
                        cacheDirectory: '.babel-cache'
                    }
                }

            ]
        },
        resolve: {
            alias: {
                // in front use rpc calls
                'jb-resources': 'resources-front.js'
            },
            modules: [
                path.resolve(__dirname, 'src/resources'),
                'node_modules'
            ]
        }
    }
];