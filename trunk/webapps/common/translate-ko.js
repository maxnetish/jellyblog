/**
 * Created by Gordeev on 23.07.2014.
 */
define('binding.ko-translate',
    [
        'ko',
        'jquery',
        'translate-service'
    ],
    function (ko, $, translateService) {
        (function(){
            ko.bindingHandlers.translate = {
                init: function(element, valueAccessor){
                    var key = valueAccessor();

                    translateService.getTextPromise(key)
                        .done(function(translated){
                            $(element).text(translated);
                        })
                        .fail(function(){
                            $(element).text(key);
                        });
                }
            };
        })();
    });