/**
 * Created by Gordeev on 23.07.2014.
 */
define('translate-service',
    [
        'jquery'
    ],
    function ($) {
        var dictionaries = {};

        var conf = {
            lang: window.navigator.userLanguage || window.navigator.language,
            fallback: 'en',
            url: '/api/locale'
        };

        var loadState = {};

        var config = function (opts) {
            if (opts) {
                conf.lang = opts.lang || conf.lang;
                conf.fallback = opts.fallback || conf.fallback;
                conf.url = opts.url || conf.url;
            }
            return conf;
        };

        var getDictionaryPromise = function (lang) {
            var dfr = $.Deferred(),
                promise;

            if (dictionaries.hasOwnProperty(lang)) {
                dfr.resolve(dictionaries.lang);
                promise = dfr.promise();
            } else if (loadState.hasOwnProperty(lang)) {
                loadState.lang
                    .done(dfr.resolve)
                    .fail(dfr.resolve);
                promise = dfr.promise();
            }
            else {
                $.get(conf.url, {lang: lang})
                    .done(function (data, textStatus, jqXHR) {
                        dictionaries[lang] = data || [];
                        dfr.resolve(data);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        dictionaries[lang] = [];
                        dfr.resolve(dictionaries[lang]);
                    })
                    .always(function () {
                        delete loadState[lang];
                    });
                promise = dfr.promise();
                loadState[lang] = promise;
            }

            return promise;
        };

        var getTextPromise = function (key) {
            var dfr = $.Deferred();

            getDictionaryPromise(conf.lang)
                .done(function(dictLang){
                    if(dictLang.hasOwnProperty(key)){
                        dfr.resolve(dictLang[key]);
                    }else{
                        getDictionaryPromise(conf.fallback)
                            .done(function(dictFallback){
                                if(dictFallback.hasOwnProperty(key)) {
                                    dfr.resolve(dictFallback[key]);
                                }else{
                                    dfr.resolve(key);
                                }
                            });
                    }
                });

            return dfr.promise();
        };

        return {
            config: config,
            getTextPromise: getTextPromise
        }
    });