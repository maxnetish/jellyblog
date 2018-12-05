const merge = require('webpack-merge');

const commonConfig = require('./webpack.common.config');

const serverCommonConfig = require('./webpack.config.server.common');
const serverProdConfig = require('./webpack.config.browser.prod');

const browserCommonConfig = require('./webpack.config.browser.common');
const browserProdConfig = require('./webpack.config.browser.prod');

module.exports = [
    merge(commonConfig, serverCommonConfig, serverProdConfig),
    merge(commonConfig, browserCommonConfig, browserProdConfig)
];