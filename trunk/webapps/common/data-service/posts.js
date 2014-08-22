/**
 * Created by Gordeev on 26.07.2014.
 */
define('data.posts',
    [
        'jquery',
        'ko',
        'data.mapper',
        'data.utils'
    ],
    function ($, ko, mapper, dataUtils) {
        var PostBrief = function (row) {
                row = row || {};
                this._id = row._id || undefined;
                this.title = row.title || "";
                this.date = row.date ? new Date(row.date) : new Date();
                this.slug = row.slug || "";
                this.featured = ko.observable(!!row.featured);
                this.draft = ko.observable(!!row.draft);
            },
            /**
             * Query list of posts
             * @param queryParams
             *      limit,
             *      skip,
             *      sort,
             *      fromDate,
             *      toDate,
             *      tag,
             *      search,
             *      featured,
             *      includeDraft;
             * @returns {jQuery promise of [PostBrief]}
             */
            postsQuery = function (queryParams) {
                var promise = $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: '/api/posts',
                    data: queryParams,
                    converters: {
                        'text json': mapper.create(PostBrief)
                    }
                })
                    .fail(dataUtils.onFail);
                return promise;
            };

        return {
            PostBrief: PostBrief,
            query: postsQuery
        }
    });