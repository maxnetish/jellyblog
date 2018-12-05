const merge = require('webpack-merge');

const commonConfig = require('./webpack.common.config');

const serverCommonConfig = require('./webpack.config.server.common');
const serverDevConfig = require('./webpack.config.server.dev');

const browserCommonConfig = require('./webpack.config.browser.common');
const browserDevConfig = require('./webpack.config.browser.dev');

module.exports = [
    merge(commonConfig, serverCommonConfig, serverDevConfig),
    merge(commonConfig, browserCommonConfig, browserDevConfig)
];