import {File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function remove({id} = {}) {
    if (!id) {
        return Promise.reject(400);
    }

    return Promise.all([
        File.remove({
            _id: id
        }).exec(),
        FileData.remove({
            files_id: id
        }).exec()
    ]);
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: remove
});