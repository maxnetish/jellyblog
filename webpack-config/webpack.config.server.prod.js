const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"',
        })
    ],
    mode: 'production'
};