(function () {
    var langCode = window.navigator.userLanguage || window.navigator.language;
    moment.lang(langCode);
})();

angular.module('jellyApp',
    [
        'ngSanitize',
        'pascalprecht.translate',
        'jellyRoutes',
        'jellyControllers',
        'jellyControls'
    ]);
