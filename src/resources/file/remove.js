import {File, FileData} from '../../models';

function remove({id} = {}) {
    if (!this.xhr) {
        // allow only rpc call
        return Promise.reject(500);
    }
    if (!(this.req.user && this.req.user.role === 'admin')) {
        return Promise.reject(401);
    }
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

export default remove;