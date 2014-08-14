/**
 * Created by mgordeev on 13.08.2014.
 */

var lang = require('../../locale'),
    BaseViewModel = function (row) {
        var self = this;
        row = row || {};

        this.admin = row.admin || false;
        this.preferredLocale = row.preferredLocale || 'en';
        this.pageTitle = row.pageTitle || 'Express';
        this.user = row.user || void 0;
        this.getText = function (key) {
            return lang.getText(key, self.preferredLocale);
        };
    };

module.exports = BaseViewModel;