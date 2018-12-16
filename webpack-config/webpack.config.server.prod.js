const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        })
    ],
    optimization: {
        minimize: false
    },
    mode: 'production'
};