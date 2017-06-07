const path = require('path');
const webpack = require('webpack');

const fileToExcludeFromBabel = /(node_modules|bower_components|\.lazy\.js$)/;
const jsFiles = /\.js$/;
const jsonFiles = /\.json$/;

module.exports = {
    cache: true,

    entry: {
        'adm': './src/admin-client-app.js',
        'common': [
            'core-js/es6/promise',
            'core-js/es6/array',
            'core-js/es6/object',
            'core-js/es6/symbol'/*,
            'isomorphine',
            'superagent'*/
        ]
        // vendor: ['core-js/es6/promise', 'whatwg-fetch', 'react', 'react-dom']
        // jquery: "./app/jquery",
        // bootstrap: ["!bootstrap-webpack!./app/bootstrap/bootstrap.config.js", "./app/bootstrap"],
        // react: "./app/react"
    },
    output: {
        path: path.resolve(__dirname, 'build/pub'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        publicPath: '/assets/'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({name: 'common', filename: 'common.js'})
    ],
    module: {
        rules: [
            {
                test: jsFiles,
                exclude: fileToExcludeFromBabel,
                include: path.resolve(__dirname, 'src'),
                loader: 'isomorphine',
                enforce: 'pre'
            },
            {
                test: /\.vue$/,
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
            // {
            //     test: /\.js$/,
            //     exclude: /(node_modules|bower_components)/,
            //     loader: 'babel-loader',
            //     query: {
            //         presets: [
            //             'es2015'
            //         ],
            //         plugins: [
            //             // 'syntax-jsx',
            //             // 'transform-react-jsx',
            //             // 'transform-react-display-name'
            //         ],
            //         cacheDirectory: false
            //     }
            // }
            // make sure to exclude route components here
            // {
            //     test: /\.js$/,
            //     include: path.resolve(__dirname, 'build'),
            //     exclude: routeComponentRegex,
            //     loader: 'console'
            // },
            // lazy load route components
            // {
            //     test: routeComponentRegex,
            //     include: path.resolve(__dirname, 'build'),
            //     loaders: ['console', 'bundle?lazy']
            // }
            // // required to write "require('./style.css')"
            // { test: /\.css$/,    loader: "style-loader!css-loader" },
            //
            // // required for bootstrap icons
            // { test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
            // { test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
            // { test: /\.eot$/,    loader: "file-loader?prefix=font/" },
            // { test: /\.svg$/,    loader: "file-loader?prefix=font/" },

            // required for react jsx
            // { test: /\.js$/,    loader: "jsx-loader" },
            // { test: /\.jsx$/,   loader: "jsx-loader?insertPragma=React.DOM" },
        ]
    },
    resolve: {
        alias: {
            // по умолчанию будет nanoflux.min
            // 'nanoflux': 'nanoflux/src/nanoflux'
            // prect-compat:
            // 'preact-compat/lib/ReactCSSTransitionGroup$': 'react/lib/ReactCSSTransitionGroup',
            // "react": "preact-compat",
            // "react-dom": "preact-compat",
            // 'react-addons-css-transition-group': 'rc-css-transition-group'

            // Bind version of jquery
            // jquery: "jquery-2.0.3",

            // Bind version of jquery-ui
            // "jquery-ui": "jquery-ui-1.10.3",

            // jquery-ui doesn't contain a index file
            // bind module to the complete module
            // "jquery-ui-1.10.3$": "jquery-ui-1.10.3/ui/jquery-ui.js",
        }
    }
    /*,
     plugins: [
     new webpack.ProvidePlugin({
     // Automtically detect jQuery and $ as free var in modules
     // and inject the jquery library
     // This is required by many jquery plugins
     jQuery: "jquery",
     $: "jquery"
     })
     ]*/
}
;