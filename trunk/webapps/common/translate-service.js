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
                console.log('getDictionaryPromise: immediate resolve');
                dfr.resolve(dictionaries.lang);
                promise = dfr.promise();
            } else if (loadState.hasOwnProperty(lang)) {
                console.log('getDictionaryPromise: wait for request done');
                loadState[lang]
                    .done(dfr.resolve)
                    .fail(dfr.resolve);
                promise = dfr.promise();
            }
            else {
                console.log('getDictionaryPromise: make request and wait');
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
                        console.log('getDictionaryPromise: request done, clear load state '+lang);
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
                        console.log('getTextPromise: resolve from lang dict '+key);
                        dfr.resolve(dictLang[key]);
                    }else{
                        getDictionaryPromise(conf.fallback)
                            .done(function(dictFallback){
                                if(dictFallback.hasOwnProperty(key)) {
                                    console.log('getTextPromise: resolve from fallback dict '+key);
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