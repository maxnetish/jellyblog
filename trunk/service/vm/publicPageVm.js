/**
 * Created by mgordeev on 14.08.2014.
 */

var BaseVm = require('./commonVm'),
    _ = require('underscore'),
    dataProvider = require('../dataProvider'),
    Q = require('q');

var PublicPageVm = function (row) {
    this.navlinksMain = row.navlinksMain || [];
    this.navlinksFooter = row.navlinksFooter || [];
    this.settings = row.settings || {};
    this.pager = row.pager || {
        urlOlder: void 0,
        urlNewer: void 0
    };
};

var filterNavlinksByCateg = function (categ) {
    return function (navlinks) {
        return _.filter(navlinks, function (item) {
            return categ === item.category;
        });
    };
};

var promisePublicPageVm = function (row) {
    var promiseNavlinks = dataProvider.promiseNavlinkList({
            visible: true
        }),
        promiseSettings = dataProvider.promiseSettings(),
        dfr = Q.defer();

    Q.all([promiseNavlinks, promiseSettings])
        .then(function (results) {
            var navlinks = results[0],
                settings = results[1],
                baseVm = new BaseVm(row),
                internVm, vm;

            internVm = new PublicPageVm({
                navlinksMain: filterNavlinksByCateg('main')(navlinks),
                navlinksFooter: filterNavlinksByCateg('footer')(navlinks),
                settings: settings
            });

            vm = _.extend(internVm, baseVm);

            dfr.resolve(vm);
            return results;
        })
        .then(null, function (err) {
            dfr.reject(err);
            return err;
        });

    return dfr.promise;
};

module.exports = {
    promise: promisePublicPageVm
};