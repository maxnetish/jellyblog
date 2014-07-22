/**
 * Created by Gordeev on 21.07.2014.
 */
define('router', ['jquery', 'path', 'ko', '_', 'route-definition'], function ($, path, ko, _, routeDefinition) {
    (function () {
        var routeDefinitions = routeDefinition.definitions,
            show = function (definition) {
                if(_.isString(definition.view) && definition.view.length){
                    $(definition.view).show();
                }
            },
            hide = function (definition) {
                if(_.isString(definition.view) && definition.view.length){
                    $(definition.view).hide();
                }
            },
            applyKoBindingOnce = function (definition) {
                definition.applyBidningOnce();
            },
            createEnterCallback = function (definition) {
                return function () {
                    show(definition);
                    applyKoBindingOnce(definition);
                    if (_.isFunction(definition.enter)) {
                        definition.enter({
                            state: definition.state,
                            params: this.params
                        });
                    }
                };
            },
            createOnCallback = function (definition) {
                return function () {
                    if (_.isFunction(definition.on)) {
                        definition.on({
                            state: definition.state,
                            params: this.params
                        });
                    }
                };
            },
            createExitCallback = function (definition) {
                return function () {
                    if (_.isFunction(definition.exit)) {
                        definition.exit({
                            state: definition.state,
                            params: this.params
                        });
                    }
                    hide(definition);
                };
            };

        _.each(routeDefinitions, function (definition) {
            if(_.isString(definition.route)) {
                path.map(definition.route)
                    .enter(createEnterCallback(definition))
                    .to(createOnCallback(definition))
                    .exit(createExitCallback(definition));
            }
        });
        path.root("#!/posts");
        path.rescue(function () {
            alert("404: Route Not Found");
        });
        path.listen();
    })();
});