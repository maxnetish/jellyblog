import {Post} from '../models';

function processPosts() {

    let condition = {
        allowRead: {
            $exists: false
        }
    };

    let updateOps = {
        $set: {
            allowRead: 'FOR_ALL'
        }
    };

    return Post.updateMany(condition, updateOps)
        .exec()
        .then(result => {
            console.info('Migration #10: set allowRead: "FOR_ALL": ', result);
            return result;
        });
}

export default {
    key: 10,
    promiseMigration: processPosts
};