/**
 * Created by Gordeev on 30.08.2014.
 */

define('data.log',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var LogEntry = function (row) {
            var self = this, prop;
            for (prop in row) {
                this[prop] = row[prop];
            }

            this.asArray = [];
            for (prop in this) {
                if (prop !== 'asArray' && prop !== '_id' && prop !== '__v') {
                    this.asArray.push({
                        name: prop,
                        value: this[prop]
                    });
                }
            }

            this.visible = ko.observable(true);
            this.expanded = ko.observable(false);
        };

        var onFail = dataUtils.onFail;
        var query = function (opts) {
            return $.ajax({
                dataType: 'json',
                type: 'GET',
                url: '/api/log',
                data: opts,
                converters: {
                    'text json': mapper.create(LogEntry)
                }
            })
                .fail(onFail);
        };

        return {
            Model: LogEntry,
            query: query
        };
    });