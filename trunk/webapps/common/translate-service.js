/**
 * Created by Gordeev on 23.07.2014.
 */
define('translate-service',
    [

    ],
    function () {
        var langCode = window.navigator.userLanguage || window.navigator.language;
        var supportedLangs = {
            en: {},
            ru: {}
        };
        var dictionaries = {};

        Object.defineProperty(dictionaries, 'en',{
            configurable: true,
            enumerable: true,
            get: function(){
                return dictionaries['en'];
            }
        });

        return {
            langCode: langCode
        }
    });