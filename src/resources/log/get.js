import {applyCheckPermissions} from '../../utils-data';
import {Log} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import {isUndefined} from 'lodash';

function fetch({page = 1, err, dateTo, dateFrom} = {}) {
    let condition = {};
    let projection = null;
    let opts = {
        lean: true,
        limit: mongooseConfig.paginationDefaultLimit + 1,
        sort: '-_id'
    };
    let sanitizedFrom = dateFrom ? new Date(dateFrom) : null;
    let sanitizedTo = dateTo ? new Date(dateTo) : null;

    // set criteria
    if (err) {
        Object.assign(condition, {
            error: {
                $exists: true
            }
        });
    } else if(!isUndefined(err)) {
        Object.assign(condition, {
            error: {
                $exists: false
            }
        });
    }
    if (sanitizedTo) {
        condition.date = condition.date || {};
        Object.assign(condition.date, {
            $lte: sanitizedTo
        });
    }
    if (sanitizedFrom) {
        condition.date = condition.date || {};
        Object.assign(condition.date, {
            $gte: sanitizedFrom
        });
    }

    // set page
    page = parseInt(page, 10) || 1;
    opts.skip = (page - 1) * mongooseConfig.paginationDefaultLimit;

    return Log.find(condition, projection, opts)
        .exec()
        .then(function (findResult) {
            findResult = findResult || [];
            let findedLen = findResult.length;
            if (findedLen > mongooseConfig.paginationDefaultLimit) {
                findResult.splice(mongooseConfig.paginationDefaultLimit, findedLen - mongooseConfig.paginationDefaultLimit);
            }
            return {
                items: findResult,
                hasMore: findedLen > mongooseConfig.paginationDefaultLimit
            };
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: fetch
});