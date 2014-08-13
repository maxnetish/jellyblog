/**
 * Created by mgordeev on 13.08.2014.
 */

var lang = require('../../locale'),
    BaseViewModel = function () {
        var self = this;

        this.admin = false;
        this.preferredLocale = 'en';
        this.pageTitle = 'Express';
        this.user = void 0;
        this.getText = function (key) {
            return lang.getText(key, self.preferredLocale);
        };
    };

module.exports = {
    BaseViewModel: BaseViewModel
};