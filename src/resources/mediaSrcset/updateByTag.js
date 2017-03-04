import {MediaSrcset, File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function remove(items, tag) {
    let projection = 'mediaFile';
    let ids = items.map(i => t._id);
    let condition = {
        tag: tag,
        _id: {
            $nin: ids
        }
    };
    let opts = {
        lean: true
    };

    return MediaSrcset.find(condition, projection, opts)
        .then(toRemove => {
            toRemove = toRemove || [];
            let fileIdsToRemove = toRemove.map(i => i.mediaFile);
            let idsToRemove = toRemove.map(i => i._id);
            // clear attached files and docs in collection
            return Promise.all([
                File.remove({
                    _id: {$in: fileIdsToRemove}
                }).exec(),
                FileData.remove({
                    files_id: {$in: fileIdsToRemove}
                }).exec(),
                MediaSrcset.remove({
                    _id: {$in: idsToRemove}
                })
            ]);
        });
}

function update(items, tag) {
    let existentItems = items.filter(i => !!item._id);

    let updates = existentItems.map(i => {
        let modelToUpdate = Object.assign({
            tag: tag
        }, i);
        delete modelToUpdate._id;
        return MediaSrcset.update({
            _id: i._id
        }, modelToUpdate, {
            upsert: false,
            multi: false,
            runValidators: true
        });
    });

    return Promise.all(updates);
}

function add(items, tag) {
    // We should add files first
    let newItems = items.filter(i => !item._id);
    newItems = newItems.map(i => Object.assign({tag: tag}, i));
    return MediaSrcset.create(newItems);
}

function clearItems(items) {
    return items.map(i => {
        return {
            mediaQuery: i.mediaQuery,
            mediaFile: i.mediaFile,
            visible: i.visible
        };
    });
}

function resourceFn({items = [], tag}={}) {
    // we should check that all tags in items are same as in tag parameter

    // we should determine _ids to remove
    // update existent
    // and add new

    //http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate

    if (!tag) {
        throw new Error('You should provide tag');
    }

    let clearedItems = clearItems(items);

    return Promise.all([
        remove(clearedItems, tag),
        update(clearedItems, tag),
        add(clearedItems, tag)
    ])
        .then(result => {
            return MediaSrcset.find({tag: tag}, null, {lean: true})
                .populate('mediaFile')
                .exec();
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: 'admin',
    resourceFn
});