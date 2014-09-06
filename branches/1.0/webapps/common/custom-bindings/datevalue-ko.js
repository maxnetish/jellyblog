/**
 * binding for input type date
 * value in viemodel will be Date
 */
define('binding.ko-datevalue',
    [
        'ko'
    ],
    function (ko) {

        (function () {
            /**
             * return string like '2014-02-15' that need for input date
             * @param date
             * @returns {string}
             */
            var formatForDateInput = function (date) {
                    var year, month, dateInMonth,
                        result, i, iLen;

                    if (!date) {
                        return '';
                    }

                    year = date.getFullYear().toFixed(0);
                    month = (date.getMonth() + 1).toFixed(0);
                    dateInMonth = date.getDate().toFixed(0);

                    if (year.length < 4) {
                        for (i = 0, iLen = 4 - year.length; i < iLen; i++) {
                            year = '0' + year;
                        }
                    }
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    if (dateInMonth.length < 2) {
                        dateInMonth = '0' + dateInMonth;
                    }
                    result = year + '-' + month + '-' + dateInMonth;

                    return result;
                },
                dateFromDateInput = function (inputValue) {
                    if (inputValue) {
                        return new Date(inputValue);
                    } else {
                        return null;
                    }
                },
                inputEventName = 'input';


            ko.bindingHandlers.dateValue = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = valueAccessor(),
                        onInput = function (e) {
                            var valueDate = dateFromDateInput(element.value);
                            if (ko.isObservable(value)) {
                                value(valueDate);
                            } else {
                                value = valueDate;
                            }
                        };
                    element.addEventListener(inputEventName, onInput);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        // This will be called when the element is removed by Knockout or
                        // if some other part of your code calls ko.removeNode(element)
                        element.removeEventListener(inputEventName, onInput);
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var newDateForInput = formatForDateInput(new Date(ko.unwrap(valueAccessor())));
                    element.value = newDateForInput;
                }
            };
        })();
    });
