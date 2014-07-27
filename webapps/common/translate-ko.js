/**
 * Created by Gordeev on 23.07.2014.
 */
define('binding.ko-translate',
    [
        'ko',
        'jquery',
        'translate-service',
        'messenger'
    ],
    function (ko, $, translateService, messenger) {
        var insertTextTo = function (key, to) {
            translateService.getTextPromise(key)
                .done(function (translated) {
                    $(to).text(translated);
                })
                .fail(function () {
                    $(to).text(key);
                });
        };

        (function () {
            ko.bindingHandlers.translate = {
                init: function (element, valueAccessor) {
                    var key = valueAccessor();
                    insertTextTo(key, element);
                    messenger.subscribe({
                        messageName: messenger.messageNames.TranslateLangChanged,
                        callback: function () {
                            insertTextTo(key, element);
                        },
                        async: true
                    });
                }
            };
        })();
    });