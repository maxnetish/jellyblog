/**
 * Created by Gordeev on 22.07.2014.
 */
define('route-definition',
    [
        '_',
        'jquery',
        'ko'
    ], function (_, $, ko) {
        var RouteDefinition = function (row) {
                var self = this;

                this.view = row.view || '';                // селектор на участок разметки
                this.viewModel = row.viewModel || null;    // объект - вьюмодель
                this.enter = row.enter || null;            // колбек - перед изменением роута
                this.on = row.on || null;                  // колбек - после изменения роута
                this.exit = row.exit || null;              // колбек - перед выходом из роута
                this.state = row.state || null;            // объект, который будет передаваться в колбеки
                this.route = row.route || '';              // шаблон пути типа '#!/user/(:userId)'

                this.applyBidningOnce = _.once(function () {
                    if (self.viewModel && _.isString(self.view) && self.view.length) {
                        ko.applyBindings(self.viewModel, $(self.view).get(0));
                    }
                });
            },
            definitions = [
                new RouteDefinition({
                    view: '#admin-posts',
                    viewModel: {},
                    route: '#!/posts'
                }),
                new RouteDefinition({
                    view: '#admin-misc',
                    viewModel: {},
                    route: '#!/misc'
                })
            ];

        return {
            definitions: definitions,
            RouterDefinition: RouteDefinition
        }
    });