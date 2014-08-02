/**
 * one post client model
 * Created by Gordeev on 02.08.2014.
 */
define('data.post',
    [
        'jquery',
        'ko',
        '_',
        'data.mapper',
        'logger'
    ],
    function ($, ko, _, mapper, logger) {
        var PostDetails = function (row) {
                row = row || {};
                this._id = row._id || undefined;
                this.title = ko.observable(row.title);
                this.date = ko.observable(row.date ? new Date(row.date) : new Date());
                this.slug = ko.observable(row.slug);
                this.featured = ko.observable(!!row.featured);
                this.draft = ko.observable(!!row.draft);
                this.content = ko.observable(row.content);
                this.image = ko.observable(row.image);
                this.metaTitle = ko.observable(row.metaTitle);
                this.metaDescription = ko.observable(row.metaDescription);
                this.tags = ko.observableArray(row.tags);
            },
            onFail = function (jqXHR, textStatus, errorThrown) {
                logger.log({
                    status: textStatus,
                    error: errorThrown
                });
            },
            get = function (id) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/post',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            },
            save = function (postDeatils) {
                var promise, plain;

                plain = postDeatils.toPlain();
                PostDetails.clearEmptyStrings.call(plain);

                promise = $.ajax({
                    dataType: 'json',
                    type: 'POST',
                    url: '/api/post',
                    data: plain,
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            },
            remove = function (id) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'DELETE',
                    url: '/api/post',
                    data: {
                        id: id
                    },
                    converters: {
                        'text json': mapper.create(PostDetails)
                    }
                })
                    .fail(onFail);
                return promise;
            };

        PostDetails.prototype.clearEmptyStrings = function () {
            var prop;
            for (prop in this) {
                if (_.isString(this[prop]) && this[prop].length === 0) {
                    this[prop] = undefined;
                }
            }
        };

        PostDetails.prototype.toPlain = function(){
            var result={};
            _.forOwn(this, function(val, key){
                if(ko.isObservable(val)){
                    result[key] = val();
                }else if(!_.isFunction(val)){
                    result[key] = val;
                }
            });
            return result;
        };

        return {
            PostDetails: PostDetails,
            get: get,
            save: save,
            remove: remove
        };
    });
