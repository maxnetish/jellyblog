import URL from 'url-parse';

function createPaginationModel({currentUrl = '/', currentPage = 1, hasMore = false} = {}) {
    let currentPageAsNumber = parseInt(currentPage, 10);
    currentPageAsNumber = isNaN(currentPageAsNumber) ? 1 : currentPageAsNumber;

    let urlObj = URL(currentUrl, true);
    let currentQuery = urlObj.query || {};
    let newQuery;
    let result = {};

    if (currentPage === 2) {
        newQuery = Object.assign({}, currentQuery);
        if (newQuery.hasOwnProperty('page')) {
            delete newQuery.page;
        }
        result.previous = urlObj.set('query', newQuery).href;
    } else if (currentPage > 2) {
        newQuery = Object.assign(currentQuery, {page: currentPage - 1});
        result.previous = urlObj.set('query', newQuery).href;
    }

    if (hasMore) {
        newQuery = Object.assign(currentQuery, {page: currentPage + 1});
        result.next = urlObj.set('query', newQuery).href;
    }

    return result;
}

export default createPaginationModel;