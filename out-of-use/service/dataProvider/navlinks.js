var model = require('../../models').model,
    _ = require('lodash'),
    Q = require('q'),
    utils = require('./utils');

function promiseNavlinkList (categoryOrFilter) {
    var query,
        filter;

    if (_.isString(categoryOrFilter)) {
        filter = {
            category: categoryOrFilter
        };
    } else {
        filter = categoryOrFilter;
    }

    query = model.Navlink.find(filter, null, {
        sort: 'order',
        lean: true
    });
    return query.exec();
}

function promiseNavlinkCreate (navlink) {
    var promise;

    // some post validation?
    promise = model.Navlink.create(navlink);
    return promise;
}

function promiseNavlinkUpdate (navlink) {
    var query,
        id = navlink._id;

    delete navlink._id;
    query = model.Navlink.findByIdAndUpdate(id, navlink, {new: true});
    return query.exec();
}

function promiseNavlinkRemove (id) {
    return model.Navlink.findByIdAndRemove(id).exec();
}

module.exports ={
    promiseNavlinkCreate: promiseNavlinkCreate,
    promiseNavlinkUpdate: promiseNavlinkUpdate,
    promiseNavlinkRemove: promiseNavlinkRemove,
    promiseNavlinkList: promiseNavlinkList
};