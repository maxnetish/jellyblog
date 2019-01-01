/**
 * mocha-webpack want single-configuration config
 * @type {merge}
 */

const merge = require('webpack-merge');

const commonConfig = require('./webpack.common.config');

const serverCommonConfig = require('./webpack.config.server.common');
const serverDevConfig = require('./webpack.config.server.dev');

module.exports = merge(commonConfig, serverCommonConfig, serverDevConfig);