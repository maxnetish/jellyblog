import {File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';
import isArray from 'lodash/isArray';

async function remove({id} = {}) {
    if (!id) {
        throw 400;
    }

    id = isArray(id) ? id : [id];

    if (id.length === 0) {
        throw 400;
    }

    return await Promise.all([
        File.remove({
            _id: {$in: id}
        }).exec(),
        FileData.remove({
            files_id: {$in: id}
        }).exec()
    ]);
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: remove
});