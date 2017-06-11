import {Post} from '../models';

function updateStatus({ids = [], status = 'DRAFT'} = {}) {

    if(!ids.length) {
        return Promise.resolve(false);
    }

    let updateData = {
        status: status
    };

    switch (status) {
        case 'PUB':
            Object.assign(updateData, {
                pubDate: new Date()
            });
            break;
        case 'DRAFT':
            Object.assign(updateData, {
                pubDate: null
            });
            break;
    }

    let condition = {
        _id: {$in: ids}
    };

    let queryOptions = {
        upsert: false,
        multi: true,
        runValidators: true,
        setDefaultsOnInsert: false
    };

    return Post.update(condition, updateData, queryOptions)
        .exec();
}

export default updateStatus;
