/**
 * https://github.com/zweifisch/knockout-select2
 */
define('binding.ko-select2',
    [
        'ko'
    ],
    function (ko) {
        (function () {
            ko.bindingHandlers.select2 = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    var allBindings, _base;
                    $(element).select2(valueAccessor());
                    allBindings = allBindingsAccessor();
                    if (typeof (_base = allBindings.value).subscribe === "function") {
                        _base.subscribe(function (val) {
                            return $(element).select2('val', val);
                        });
                    }
                    return ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        return $(element).select2('destroy');
                    });
                },
                update: function (element, valueAccessor, allBindingsAccessor) {
                    return $(element).trigger('change');
                }
            };

        })();
    });