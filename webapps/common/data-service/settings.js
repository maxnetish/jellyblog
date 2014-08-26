/**
 * Created by mgordeev on 08.08.2014.
 */
define('data.settings',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        'use strict';

        var Settings = function (row) {
                row = row || {};

                this._id = row._id || undefined;
                this.authorDisplayName = ko.observable(row.authorDisplayName || 'Admin');
                this.authorDisplayBio = ko.observable(row.authorDisplayBio || undefined);
                this.authorTwitterScreenName = ko.observable(row.authorTwitterScreenName || undefined);
                this.authorAvatarUrl = ko.observable(row.authorAvatarUrl || null);
                this.footerAnnotation = ko.observable(row.footerAnnotation || undefined);
                this.postsPerPage = ko.observable(row.postsPerPage || 5);
                this.siteTitle = ko.observable(row.siteTitle || null);
                this.metaTitle = ko.observable(row.metaTitle || null);
                this.metaDescription = ko.observable(row.metaDescription || null);
                this.titleImageUrl = ko.observable(row.titleImageUrl || null);
            },
            getObservable = function () {
                return $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/settings',
                    converters: {
                        'text json': mapper.create(Settings)
                    }
                })
                    .fail(dataUtils.onFail);
            },
            update = function (settings) {
                var plain = dataUtils.toPlain(settings);
                return $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/settings',
                    data: plain,
                    converters: {
                        'text json': mapper.create(Settings)
                    }
                })
                    .fail(dataUtils.onFail);
            };

        return {
            Model: Settings,
            get: getObservable,
            update: update
        };
    });