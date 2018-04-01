import {Option} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function createOrUpdateRobots({content, allowRobots}) {

    let conditions = {
        key: 'ROBOTS.TXT'
    };
    let doc = {
        value: {content, allowRobots}
    };
    let opts = {
        upsert: true,
        multi: false
    };

    return Option.update(conditions, doc, opts).exec();
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: createOrUpdateRobots
});