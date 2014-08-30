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

        var updateEntries = function () {
            dataLog.query()
                .done(function (result) {
                    logEntries(result);
                });
        };

        var activate = function () {
            updateEntries();
        };

        var toggleExpand = function (data) {
            data.expanded(!data.expanded());
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
            filter: filter
        };
    });