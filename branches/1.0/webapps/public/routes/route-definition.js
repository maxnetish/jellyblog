/**
 * Created by mgordeev on 26.08.2014.
 */
define('route-definition',
    [

    ], function () {
        'use strict';
        var RouteDefinition = function (row) {

                this.enter = row.enter || null;            // колбек - перед изменением роута
                this.on = row.on || null;                  // колбек - после изменения роута
                this.exit = row.exit || null;              // колбек - перед выходом из роута
                this.route = row.route || '';              // шаблон пути типа '/user/(:userId)'
            };

        return RouteDefinition;
    });