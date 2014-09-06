/**
 * Created by Gordeev on 30.08.2014.
 */

define('vm.log', [
        'ko',
        '_',
        'data.log'
    ],
    function (ko, _, dataLog) {
        'use strict';
        var logEntries = ko.observableArray();
        var filter = ko.observable();
        var limit = 100;

        var refreshEntries = function () {
            dataLog.query({
                limit: limit
            }).done(function (result) {
                logEntries(result);
            });
        };

        var activate = function () {
            if (!logEntries().length) {
                refreshEntries();
            }
        };

        var toggleExpand = function (data) {
            data.expanded(!data.expanded());
        };

        var loadMore = function () {
            var newQuery = {
                    limit: limit
                },
                logUnwrapped = ko.unwrap(logEntries);

            if (logUnwrapped.length) {
                newQuery.afterId = _.last(logUnwrapped)._id;
            }

            dataLog.query(newQuery)
                .done(function (result) {
                    ko.utils.arrayPushAll(logEntries, result);
                });
        };

        var refresh = function () {
            refreshEntries();
        };

        filter.subscribe(function (newFilter) {
            var entriesUnwrapped = ko.unwrap(logEntries);
            _.each(entriesUnwrapped, function (entry) {
                if (newFilter) {
                    entry.visible(entry.requestUrl.indexOf(newFilter) !== -1);
                } else {
                    entry.visible(true);
                }
            });
        });

        return {
            entries: logEntries,
            activate: activate,
            toggleExpand: toggleExpand,
            filter: filter,
            loadMore: loadMore,
            refresh: refresh
        };
    });