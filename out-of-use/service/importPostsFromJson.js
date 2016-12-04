/**
 * Created by mgordeev on 25.08.2014.
 */
var Q = require('q');
var fs = require('fs-extra');
var _ = require('underscore');
var dataProvider = require('./dataProvider');

var converterFromGhostExportObject = {
    getPostsArray: function (row) {
        if (row && row.data && _.isArray(row.data.posts)) {
            return row.data.posts;
        }
        return [];
    },
    getPostTagCrossArray: function (row) {
        if (row && row.data && _.isArray(row.data.posts_tags)) {
            return row.data.posts_tags;
        }
        return [];
    },
    getTagsArray: function (row) {
        if (row && row.data && _.isArray(row.data.tags)) {
            return row.data.tags;
        }
        return [];
    },
    getTitle: function (rowPost) {
        return rowPost.title;
    },
    getDate: function (rowPost) {
        var result;
        if (rowPost.created_at) {
            result = new Date(rowPost.created_at);
        }
        return result;
    },
    getSlug: function (rowPost) {
        return rowPost.slug;
    },
    getFeatured: function (rowPost) {
        return !!rowPost.featured;
    },
    getDraft: function (rowPost) {
        // always draft
        return true;
    },
    getContent: function (rowPost) {
        return rowPost.html || rowPost.markdown;
    },
    getImage: function (rowPost) {
        return rowPost.image;
    },
    getMetatitle: function (rowPost) {
        return rowPost.meta_title;
    },
    getMetadescription: function (rowPost) {
        return rowPost.meta_description;
    },
    getTags: function (rowPost, tagsDictionary, postTagCrossArray) {
        var rowPostId = rowPost.id,
            rowTagIds = _.filter(postTagCrossArray, function (item) {
                return item.post_id === rowPostId;
            }),
            tags = _.map(rowTagIds, function (item) {
                return tagsDictionary[item.tag_id];
            });
        return tags;
    }
};

var importPosts = function (row, converter) {
    var postsArray = converter.getPostsArray(row),
        tagsArray = converter.getTagsArray(row),
        tagsDictionary = {},
        postTagCrossArray = converter.getPostTagCrossArray(row),
        postsArray;

    _.each(tagsArray, function (item) {
        tagsDictionary[item.id] = item.name;
    });

    postsArray = _.map(postsArray, function (item) {
        var newPost = {
            title: converter.getTitle(item),
            date: converter.getDate(item),
            slug: converter.getSlug(item),
            featured: converter.getFeatured(item),
            draft: converter.getDraft(item),
            content: converter.getContent(item),
            image: converter.getImage(item),
            metaTitle: converter.getMetatitle(item),
            metaDescription: converter.getMetadescription(item),
            tags: converter.getTags(item, tagsDictionary, postTagCrossArray)
        };
        return newPost;
    });
    return dataProvider.promisePostCreate(postsArray);
};

var onReadJson = function (dfr, readed) {
    importPosts(readed, converterFromGhostExportObject)
        .then(dfr.resolve, dfr.reject);
};

var importFromFile = function (fileName) {
    var dfr = Q.defer();

    fs.readJson(fileName, function (err, readed) {
        if (err) {
            dfr.reject(err);
        } else {
            onReadJson(dfr, readed);
        }
    });

    return dfr.promise;
};

module.exports = {
    importFromFile: importFromFile
};