var dataProvider = require('../../../../service/dataProvider');

function getPosts(query, preferredLocale){
    return dataProvider.promisePaginationPosts(query, preferredLocale)
}

function getSettings(){
    return dataProvider.promiseSettings();
}

module.exports = {
    getPosts: getPosts,
    getSettings: getSettings
};
