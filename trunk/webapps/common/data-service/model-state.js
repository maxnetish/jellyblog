/**
 * incapsulates dirty-pristine state logic
 */
define('model-state',
    [
        'ko',
        '_'
    ],
    function(ko, _){
        var ModelState = function(modelToWatch){
            var self = this,
                handlers = [],
                onChange = function(newValue){
                    self.setDirty();
                },
                beginWatch = function(model){
                    var modelUnwrapped;
                    if(ko.isObservable(model)){
                        // TODO: к этой подписке ещё надо добавить endWatch для внутренних
                        // элементов (при изменении родительского объекта все дочернии
                        // становятся другими) и beginWatchOnInnerProperties
                        //
                        handlers.push(model.subscribe(onChange));
                        modelUnwrapped = ko.unwrap(model);
                        if(_.isArray(modelUnwrapped)){
                            _.each(modelUnwrapped, beginWatchOnInnerProperties);
                        }else {
                            beginWatchOnInnerProperties(ko.unwrap(model));
                        }
                    }else {
                        beginWatchOnInnerProperties(model)
                    }
                },
                beginWatchOnInnerProperties = function(obj){
                    _.forOwn(model, function (value, key) {
                        if (ko.isObservable(value)) {
                            handlers.push(value.subscribe(onChange));
                        }
                    });
                },
                endWatch = function(){
                    _.each(handlers, function(subscription){
                        subscription.dispose();
                    });
                    handlers.length = 0;
                };

            this.pristine = ko.observable(true);
            this.dirty = ko.observable(false);
            this.clear = function(){
                self.pristine(true);
                self.dirty(false);
            };
            this.setDirty = function(){
                self.pristine(false);
                self.dirty(true);
            };
            this.setModel = function(model){
                endWatch();
                self.clear();
                beginWatch(model);
            };
        };

        return ModelState
    });
