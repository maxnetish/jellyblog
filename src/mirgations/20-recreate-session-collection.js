import {Session} from '../models';

async function dropSessionCollection() {
    return await Session.collection.drop();
}

export default {
    key: 20,
    promiseMigration: dropSessionCollection
};