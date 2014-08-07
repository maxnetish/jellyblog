/**
 * incapsulates dirty-pristine state logic
 */
define('model-state',
    [
        'ko',
        '_'
    ],
    function (ko, _) {
        'use strict';
        var ModelState = function (modelToWatch) {
            // 'private' members
            var self = this,
                selfHandler,
                handlers = [],
                onChange = function () {
                    self.setDirty();
                },
                beginWatchOnInnerProperties = function (obj) {
                    _.forOwn(obj, function (value) {
                        if (ko.isObservable(value)) {
                            handlers.push(value.subscribe(onChange));
                        }
                        beginWatchOnInnerProperties(ko.unwrap(value));
                    });
                },
                endWatch = function (withSelf) {
                    _.each(handlers, function (subscription) {
                        subscription.dispose();
                    });
                    if (withSelf && selfHandler) {
                        selfHandler.dispose();
                        selfHandler = undefined;
                    }
                    handlers.length = 0;
                },
                onChangeSelf = function (newValue) {
                    self.setDirty();
                    endWatch(false);
                    beginWatchOnInnerProperties(newValue);
                },
                beginWatch = function (model) {
                    if (ko.isObservable(model)) {
                        selfHandler = model.subscribe(onChangeSelf);
                    }
                    beginWatchOnInnerProperties(ko.unwrap(model));
                };

            // public interface
            this.pristine = ko.observable(true);
            this.dirty = ko.observable(false);
            this.clear = function () {
                self.pristine(true);
                self.dirty(false);
                return self;
            };
            this.setDirty = function () {
                self.pristine(false);
                self.dirty(true);
                return self;
            };
            this.setModel = function (model) {
                endWatch(true);
                self.clear();
                beginWatch(model);
                return self;
            };
            this.dispose = function(){
                endWatch(true);
            };

            // constructor
            if(modelToWatch){
                self.setModel(modelToWatch);
            }
        };

        return ModelState;
    })
;
