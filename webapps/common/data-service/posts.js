/**
 * Created by Gordeev on 26.07.2014.
 */
define('data.posts',
    [
        'jquery',
        'data.mapper',
        'logger'
    ],
    function ($, mapper, logger) {
        var PostBrief = function (row) {
                row = row || {};
                this._id = row._id || undefined;
                this.title = row.title || "";
                this.date = row.date ? new Date(row.date) : new Date();
                this.slug = row.slug || "";
                this.featured = !!row.featured;
                this.draft = !!row.draft;
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
                    .fail(function(jqXHR, textStatus, errorThrown){
                        logger.log({
                            status: textStatus,
                            error: errorThrown
                        });
                    });
                return promise;
            };

        return {
            PostBrief: PostBrief,
            query: postsQuery
        }
    });