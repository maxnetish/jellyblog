/**
 * Created by Gordeev on 14.06.2014.
 */
angular.module('dataServiceModule',
    [
    ])
    .factory('dataService',
    [
        '$http',
        '$cacheFactory',
        'jellyLogger',
        function ($http, $cacheFactory, logger) {
            var PostBrief = function (row) {
                    row = row || {};
                    this._id = row._id || undefined;
                    this.title = row.title || "";
                    this.date = row.date ? new Date(row.date) : new Date();
                    this.slug = row.slug || "";
                    this.featured = !!row.featured;
                    this.draft = !!row.draft;
                },
                PostDetails = function (row) {
                    row = row || {};
                    this._id = row._id || undefined;
                    this.title = row.title || "";
                    this.date = row.date ? new Date(row.date) : new Date();
                    this.slug = row.slug;
                    this.featured = !!row.featured;
                    this.draft = !!row.draft;
                    this.content = row.content || "";
                    this.image = row.image || null;
                    this.metaTitle = row.metaTitle || "";
                    this.metaDescription = row.metaDescription || "";
                    this.tags = row.tags || [];
                },
                Navlink = function (row) {
                    row = row || {};

                    this._id = row._id || undefined;
                    this.text = row.text || "";
                    this.url = row.url || "";
                    this.category = row.category || 'main';
                    this.disabled = row.disabled || false;
                    this.visible = row.visible || true;
                    this.icon = row.icon || "";
                    this.order = row.order || 0;
                    this.willRemove = false;
                    this.newWindow = row.newWindow || false;
                },
                FileInfo = function (row) {
                    row = row || {};

                    this.name = row.name;
                    this.date = new Date(row.ctime);
                    this.size = row.size;
                    this.url = row.url;
                },
                responseMapper = function (Model) {
                    return function (data) {
                        var rowData,
                            mappedData;

                        try {
                            rowData = angular.fromJson(data);
                        } catch (err) {
                            logger.log(err);
                        }

                        if (!rowData) {
                            return null;
                        }

                        if (angular.isArray(rowData)) {
                            mappedData = [];
                            angular.forEach(rowData, function (item) {
                                mappedData.push(new Model(item));
                            });
                        } else {
                            mappedData = new Model(rowData);
                        }
                        return mappedData;
                    };
                },
                navlinkQuery = function (category) {
                    return $http({
                        method: 'GET',
                        url: '/api/navlinks',
                        params: {
                            category: category
                        },
                        data: {},
                        transformResponse: responseMapper(Navlink),
                        cache: true
                    })
                },
                navlinkSave = function (navlink) {
                    navlink.clearEmptyStrings();
                    return $http({
                        method: 'POST',
                        url: '/api/navlink',
                        params: {},
                        data: navlink,
                        transformResponse: responseMapper(Navlink),
                        cache: false
                    })
                        .then(function (response) {
                            // reset default cache
                            var cache = $cacheFactory.get('$http');
                            cache.removeAll();

                            return response;
                        });
                },
                navlinkRemove = function (navlink) {
                    var params = {};
                    params.id = navlink._id;

                    return $http({
                        method: 'DELETE',
                        url: '/api/navlink',
                        params: params,
                        transformResponse: responseMapper(Navlink),
                        cache: false
                    })
                        .then(function (response) {
                            // reset default cache
                            var cache = $cacheFactory.get('$http');
                            cache.removeAll();
                            return response;
                        });
                },
                postsQuery = function (queryParams) {
                    return $http({
                        method: 'GET',
                        url: '/api/posts',
                        params: queryParams,
                        data: {},
                        transformResponse: responseMapper(PostBrief),
                        cache: true
                    });
                },
                postGet = function (idOrPostBrief) {
                    var params = {};
                    if (idOrPostBrief instanceof PostBrief) {
                        params.id = idOrPostBrief._id;
                    } else {
                        params.id = idOrPostBrief;
                    }
                    return $http({
                        method: 'GET',
                        url: '/api/post',
                        params: params,
                        data: {},
                        transformResponse: responseMapper(PostDetails),
                        cache: true
                    });
                },
                postSave = function (postDetails) {
                    postDetails.clearEmptyStrings();
                    return $http({
                        method: 'POST',
                        url: '/api/post',
                        params: {},
                        data: postDetails,
                        transformResponse: responseMapper(PostDetails),
                        cache: false
                    })
                        .then(function (response) {
                            // reset default cache
                            var cache = $cacheFactory.get('$http');
                            cache.removeAll();

                            return response;
                        });
                },
                postRemove = function (idOrPostBrief) {
                    var params = {};

                    if (idOrPostBrief instanceof PostBrief) {
                        params.id = idOrPostBrief._id;
                    } else {
                        params.id = idOrPostBrief;
                    }

                    return $http({
                        method: 'DELETE',
                        url: '/api/post',
                        params: params,
                        transformResponse: responseMapper(PostDetails),
                        cache: false
                    })
                        .then(function (response) {
                            // reset default cache
                            var cache = $cacheFactory.get('$http');
                            cache.removeAll();
                            return response;
                        });
                },
                readUploadDir = function(){
                    return $http({
                        method: 'GET',
                        url: 'api/upload',
                        transformResponse: responseMapper(FileInfo)
                    });
                },
                uploadFile = function(fileToUpload){
                    var formData = new FormData();
                    formData.append('file_0', fileToUpload);

                    return $http({
                        method: 'POST',
                        url: 'api/upload',
                        data: formData,
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined},
                        transformResponse: responseMapper(FileInfo)
                    });
                },
                clearEmptyStrings = function () {
                    var prop;
                    for (prop in this) {
                        if (angular.isString(this[prop]) && this[prop].length === 0) {
                            this[prop] = undefined;
                        }
                    }
                };

            PostDetails.prototype.clearEmptyStrings = clearEmptyStrings;
            Navlink.prototype.clearEmptyStrings = clearEmptyStrings;

            return{
                postProvider: {
                    query: postsQuery,
                    get: postGet,
                    save: postSave,
                    remove: postRemove
                },
                navlinkProvider: {
                    query: navlinkQuery,
                    save: navlinkSave,
                    remove: navlinkRemove
                },
                uploadProvider: {
                    query: readUploadDir,
                    save: uploadFile
                },
                PostDetailsModel: PostDetails,
                PostBriefModel: PostBrief,
                Navlink: Navlink,
                FileInfo: FileInfo
            };
        }
    ]);
