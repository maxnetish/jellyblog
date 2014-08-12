/**
 * Created by Gordeev on 23.07.2014.
 */
define('translate-service',
    [
        'jquery',
        '_',
        'messenger'
    ],
    function ($, _, messenger) {
        'use strict';
        var dictionaries = {},
            conf = {
                lang: window.navigator.userLanguage || window.navigator.language,
                fallback: 'en',
                url: '/api/locale'
            },
            loadState = {},
            onConfChanged = _.debounce(function () {
                messenger.publish(messenger.messageNames.TranslateLangChanged);
            }, 500, {
                leading: false,
                trailing: true
            }),
            config = function (opts) {
                var changed = false;
                if (opts) {
                    if (conf.lang !== opts.lang || conf.fallback !== opts.fallback || conf.url !== opts.url) {
                        conf = opts;
                        onConfChanged();
                    }
                }
                return conf;
            },
            getDictionaryPromise = function (lang) {
                var dfr = $.Deferred(),
                    promise;

                if (dictionaries.hasOwnProperty(lang)) {
                    dfr.resolve(dictionaries[lang]);
                    promise = dfr.promise();
                } else if (loadState.hasOwnProperty(lang)) {
                    loadState[lang]
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
            },
            getTextPromise = function (key) {
                var dfr = $.Deferred();

                getDictionaryPromise(conf.lang)
                    .done(function (dictLang) {
                        if (dictLang.hasOwnProperty(key)) {
                            dfr.resolve(dictLang[key]);
                        } else {
                            getDictionaryPromise(conf.fallback)
                                .done(function (dictFallback) {
                                    if (dictFallback.hasOwnProperty(key)) {
                                        dfr.resolve(dictFallback[key]);
                                    } else {
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
        };
    });