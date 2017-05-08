import {applyCheckPermissions} from '../../utils-data';
import {Log} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';

function fetch({page = 1} = {}) {
    let condition = {};
    let projection = null;
    let opts = {
        lean: true,
        limit: mongooseConfig.paginationDefaultLimit + 1,
        sort: {date: 'desc'}
    };

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