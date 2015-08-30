var dataProvider = require('../../../../service/dataProvider');

function getPosts(query, preferredLocale, limit){
    return dataProvider.promisePaginationPosts(query, preferredLocale, limit)
}

function getSettings(){
    return dataProvider.promiseSettings();
}

module.exports = {
    getPosts: getPosts,
    getSettings: getSettings
};
