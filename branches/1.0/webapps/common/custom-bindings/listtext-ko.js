/**
 * bind array of tags to input
 */
define('binding.ko-listtext',
    [
        'ko'
    ],
    function (ko) {
        (function () {
            ko.bindingHandlers.listText = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var eventsToCatch = ['change'];
                    var requestedEventsToCatch = allBindings.get('valueUpdate');
                    var listDelimiter = allBindings.get('listSeparator') || ' ';
                    var propWriters;

                    var valueUpdateHandler = function () {
                        var modelValue = valueAccessor();
                        var elementValue = ko.selectExtensions.readValue(element);
                        var elementValueArray = elementValue.split(listDelimiter);

                        // expressionRewriting.writeValueToProperty не экспортируется
                        if(!modelValue || !ko.isObservable(modelValue)){
                            propWriters = allBindings.get('_ko_property_writers');
                            if(propWriters && propWriters['value']){
                                propWriters['value'](elementValueArray);
                            }
                        }else if(ko.isWriteableObservable(modelValue)){
                            modelValue(elementValueArray);
                        }
                    };

                    if (requestedEventsToCatch) {
                        if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                            requestedEventsToCatch = [requestedEventsToCatch];
                        ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
                        eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
                    }

                    ko.utils.arrayForEach(eventsToCatch, function (eventName) {
                        // The syntax "after<eventname>" means "run the handler asynchronously after the event"
                        // This is useful, for example, to catch "keydown" events after the browser has updated the control
                        // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
                        var handler = valueUpdateHandler;
                        // -> stringStartsWith
                        if (eventName.startsWith("after")) {
                            handler = function () {
                                setTimeout(valueUpdateHandler, 0)
                            };
                            eventName = eventName.substring("after".length);
                        }
                        ko.utils.registerEventHandler(element, eventName, handler);
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var newValue = ko.utils.unwrapObservable(valueAccessor());
                    var elementValue = ko.selectExtensions.readValue(element);
                    var listDelimiter = allBindings.get('listSeparator') || ' ';
                    var newValueStr = newValue.join(listDelimiter);
                    var valueHasChanged = (newValueStr !== elementValue);

                    if (valueHasChanged) {
                        ko.selectExtensions.writeValue(element, newValueStr);
                    }
                }
            }
        })();
    });