/**
 * DEPRECATED
 */
import {Tag} from '../models';

/**
 * Receives array of tags (as strings) and resolve to array of _id of passed tags
 * @param tags
 * @returns {Promise.<*>}
 */
export default function updateTags(tags) {
    tags = tags || [];

    let result = [];
    let promises = tags.map(t => Tag.findOne({value: t}, {}, {lean: true})
        .exec()
        .then(res => res || Tag.create({value: t}))
        .then(res => res._id)
    );

    return Promise.all(promises);
}