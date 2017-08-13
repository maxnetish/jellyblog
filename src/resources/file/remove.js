import {File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';
import isArray from 'lodash/isArray';

function remove({id} = {}) {
    if (!id) {
        return Promise.reject(400);
    }

    id = isArray(id) ? id : [id];

    if(id.length === 0) {
        return Promise.reject(400);
    }

    return Promise.all([
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