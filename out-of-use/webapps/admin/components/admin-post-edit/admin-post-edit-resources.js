var request = require('superagent');
var Q = require('q');

function getPostDetails(postId) {
    var dfr = Q.defer();

    request
        .get('/api/post')
        .query({
            id: postId
        })
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function getAllTags() {
    var dfr = Q.defer();

    request
        .get('/api/tags/list')
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function updatePost(post){
    var dfr = Q.defer();

    request
        .put('/api/post')
        .send(post)
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function createPost(postData){
    var dfr = Q.defer();

    request
        .post('/api/post')
        .send(postData)
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function removePost(postId){
    var dfr = Q.defer();

    request
        .del('/api/post')
        .query({
            id: postId
        })
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

module.exports = {
    getPostDetails: getPostDetails,
    getAllTags: getAllTags,
    updatePost: updatePost,
    createPost: createPost,
    removePost: removePost
};