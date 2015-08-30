
function generatePaginationUrlParams(posts, skip, limit) {
    var result = {
        previous: null,
        next: null
    };

    posts = posts || [];
    skip = parseInt(skip, 10) || 0;
    limit = parseInt(limit, 10) || Number.POSITIVE_INFINITY;

    if (posts.length >= limit) {
        // not last page
        result.previous = {
            skip: skip + posts.length
        }
    }

    if (skip > 0) {
        result.next = {
            skip: skip - limit
        }
    }

    return result;
}

module.exports = {
    generatePaginationUrlParams: generatePaginationUrlParams
};