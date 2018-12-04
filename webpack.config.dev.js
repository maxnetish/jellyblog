const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const path = require('path');
const jsFiles = /\.js$/;
const vueComponents = /\.vue$/;
const jsonFiles = /\.json$/;
const pugFiles = /\.pug$/;
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
                    loader: 'vue-loader'
                    /*,
                    options: {
                        loaders: {
                            // vue-loader does not apply babel transpiling as default, so required:
                            // js: 'babel-loader?presets[]=es2015'
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
                                        'transform-object-rest-spread',
                                        'transform-decorators-legacy'
                                    ]
                                }
                            }
                        }
                        // other vue-loader options go here
                    }*/
                },
                // {
                //     test: jsonFiles,
                //     loader: 'json-loader'
                // },
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
                                'transform-object-rest-spread',
                                'transform-decorators-legacy'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.pug$/,
                    oneOf: [
                        // это применяется к `<template lang="pug">` в компонентах Vue
                        {
                            resourceQuery: /^\?vue/,
                            use: ['pug-plain-loader']
                        },
                        // это применяется к импортам pug внутри JavaScript
                        {
                            use: ['raw-loader', 'pug-plain-loader']
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'less-loader'
                    ]
                }
            ]
        },
        devtool: '#source-map',
        // devtool: 'cheap-module-source-map',
        plugins: [
            new VueLoaderPlugin()
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
        },
        mode: 'development'
    },
    {
        // front
        cache: true,
        entry: {
            'adm': './src/admin-vue-app/admin-client-browser-entry.js',
            // 'pub': './src/pub-index-app',
            'pub-ssr': './src/pub-vue-app/pub-client-browser-entry.js'
        },
        output: {
            path: path.resolve(__dirname, 'build/pub'),
            filename: '[name].js',
            chunkFilename: '[name].chunk.js',
            publicPath: '/assets/'
        },
        target: 'web',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"development"',
            }),
            new VueLoaderPlugin(),
            new VueSSRClientPlugin()
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: 'common',
            //     filename: 'common.js'
            // })
        ],
        module: {
            rules: [
                {
                    test: vueComponents,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            // vue-loader does not apply babel transpiling as default, so required:
                            // js: 'babel-loader?presets[]=es2015'
                        }
                        // other vue-loader options go here
                    }
                },
                // {
                //     test: jsonFiles,
                //     loader: 'json-loader'
                // },
                {
                    test: jsFiles,
                    include: path.resolve(__dirname, 'src'),
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
                    test: /\.css$/,
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.pug$/,
                    oneOf: [
                        // это применяется к `<template lang="pug">` в компонентах Vue
                        {
                            resourceQuery: /^\?vue/,
                            use: ['pug-plain-loader']
                        },
                        // это применяется к импортам pug внутри JavaScript
                        {
                            use: ['raw-loader', 'pug-plain-loader']
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'less-loader'
                    ]
                }
            ]
        },
        // devtool: '#source-map',
        devtool: 'cheap-module-source-map',
        resolve: {
            alias: {
                // in front use rpc calls
                'jb-resources': 'resources-front.js'
            },
            modules: [
                path.resolve(__dirname, 'src/resources'),
                'node_modules'
            ]
        },
        mode: 'development',
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
    }
];