/**
 * Created by mgordeev on 08.08.2014.
 */
define('vm.files',
    [
        'ko',
        'data.files'
    ],
    function (ko, providerFiles) {
        'use strict';
        var files = ko.observableArray(),
            filter = ko.observable(),
            sort = ko.observable({
                orderBy: 'name',
                asc: true
            }),
            applySort = function (observableToSort, sortObject) {
                var sortInternal = ko.unwrap(sortObject);
                switch (sortInternal.orderBy) {
                    case 'name':
                        observableToSort.sort(function (left, right) {
                            if (left.name === right.name) {
                                return 0;
                            }
                            if (left.name > right.name) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                    case 'date':
                        observableToSort.sort(function (left, right) {
                            var leftUnix = left.date.valueOf(),
                                rightUnix = right.date.valueOf();
                            if (leftUnix === rightUnix) {
                                return 0;
                            }
                            if (leftUnix > rightUnix) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                    case 'size':
                        observableToSort.sort(function (left, right) {
                            if (left.size === right.size) {
                                return 0;
                            }
                            if (left.size > right.size) {
                                return 1;
                            }
                            return -1;
                        });
                        break;
                }
                if (!sortInternal.asc) {
                    observableToSort.reverse();
                }
            },
            updateView = function () {
                providerFiles.query()
                    .done(function (result) {
                        files.removeAll();
                        ko.utils.arrayPushAll(files, result);
                        applySort(files, sort);
                    });
            },
            upload = function (fileInput) {
                var f = fileInput;
                providerFiles.upload(f)
                    .done(function (result) {
                        ko.utils.arrayPushAll(files, result);
                        applySort(files, sort);
                    });
            },
            activate = function () {
                updateView();
            };

        sort.subscribe(function (newSort) {
            applySort(files, newSort);
        });

        return{
            activate: activate,
            filter: filter,
            files: files,
            setSort: function (prop) {
                var currentSort = sort();
                sort({
                    orderBy: prop,
                    asc: prop === currentSort.orderBy ? !currentSort.asc : true
                });
            },
            upload: upload
        };
    });