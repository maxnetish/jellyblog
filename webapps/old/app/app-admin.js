/**
 * Created by Gordeev on 13.06.2014.
 */

(function () {
    var langCode = window.navigator.userLanguage || window.navigator.language;
    moment.lang(langCode);
})();

angular.module('jellyApp',
    [
        'ngSanitize',
        'jellyServices',
        'jellyRoutesAdmin',
        'jellyControllersAdmin',
        'jellyControls'
    ]);