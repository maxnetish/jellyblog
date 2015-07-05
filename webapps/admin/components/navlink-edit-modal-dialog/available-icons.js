var _ = require('lodash');
var GLOBAL = (function () {
    return this
}());
var document = GLOBAL.document;
var iconSelectorPrefix = '.glyphicon-';
var iconSelectorPrefixLen = iconSelectorPrefix.length;
var iconClassTemplate = 'glyphicon glyphicon-';

var availableIcons;


function prepare() {
    var sheets = document.styleSheets;
    var result = [];

    _.each(sheets, function (cssStyleSheet) {
        _.each(cssStyleSheet.cssRules, function (cssStyleRule) {
            if (cssStyleRule.type !== 1) {
                return;
            }
            if (cssStyleRule.selectorText && cssStyleRule.selectorText.indexOf(iconSelectorPrefix) === 0) {
                result.push(cssStyleRule.selectorText);
            }
        })
    });

    result = _.map(result, function (selectorText) {
        var s = selectorText.slice(iconSelectorPrefixLen);
        return s.slice(0, s.indexOf(':'));
    });

    resut = _.uniq(result);

    result = _.map(result, function (iconId) {
        return {
            className: iconClassTemplate + iconId,
            name: iconId
        };
    });

    return result;
}

availableIcons = prepare();

module.exports = availableIcons;
