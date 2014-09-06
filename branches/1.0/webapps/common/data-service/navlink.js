/**
 * Created by Gordeev on 03.08.2014.
 */
define('data.navlink',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var Navlink = function (row) {
                var self = this;

                row = row || {};

                this._id = row._id || undefined;
                this.text = ko.observable(row.text);
                this.url = ko.observable(row.url);
                this.category = row.category || 'main';
                this.disabled = ko.observable(row.disabled || false);
                this.visible = ko.observable(row.visible || true);
                this.icon = ko.observable(row.icon);
                this.order = ko.observable(row.order || 0);
                this.willRemove = ko.observable(false);
                this.newWindow = ko.observable(row.newWindow || false);
                this.useClientRouter = ko.observable(row.useClientRouter || false);

                this.newWindow.subscribe(function (newWindowValue) {
                     if(newWindowValue){
                         self.useClientRouter(false);
                     }
                });

                this.useClientRouter.subscribe(function(useROuterValue){
                    if(useROuterValue){
                        self.newWindow(false);
                    }
                });
            },
            onFail = dataUtils.onFail,
            navlinkQuery = function (category) {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/navlinks',
                    data: {
                        category: category
                    },
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            },
            navlinkSave = function (navlink) {
                var plain = dataUtils.toPlain(navlink);
                dataUtils.clearEmptyStrings(plain);

                return $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/navlink',
                    data: plain,
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            },
            navlinkRemove = function (id) {
                return $.ajax({
                    dataType: 'json',
                    type: 'DELETE',
                    url: '/api/navlink',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(Navlink)
                    }
                })
                    .fail(onFail);
            };

        return {
            Model: Navlink,
            query: navlinkQuery,
            save: navlinkSave,
            remove: navlinkRemove
        };
    });