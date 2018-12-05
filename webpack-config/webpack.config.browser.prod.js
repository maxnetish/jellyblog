const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ],
    mode: 'production'
};