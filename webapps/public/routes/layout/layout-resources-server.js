var dataProvider = require('../../../../service/dataProvider');

function getMiscSettings() {
    return dataProvider.promiseSettings();
}

function getNavlinks() {
    return dataProvider.promiseNavlinkList();
}

module.exports = {
    getMiscSettings: getMiscSettings,
    getNavlinks: getNavlinks
};