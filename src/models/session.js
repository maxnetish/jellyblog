import mongoose from 'mongoose';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const sessionSchema = new mongoose.Schema({
    // _id
    expireAt: {
        type: Date,
        required: true
    },
    // Mixed field
    // See ".markModified()" - required for mixed fields
    sessionData: {}
});

// See https://docs.mongodb.com/manual/core/index-ttl/
// docs will remove at expireAt time
sessionSchema.index({expireAt: 1}, {expireAfterSeconds: 0});

sessionSchema.static({
    // implement session store for koa-session
    get: async function getSessionFromStore(key, maxAge, { rolling }) {
        const foundDoc = await this.findById(key, 'sessionData', {lean: true}).exec();
        const result = foundDoc && foundDoc.sessionData;
        return result;
    },
    set: async function setSessionToStore(key, sess, maxAge, { rolling, changed }) {
        const localMaxAge = (typeof maxAge === 'number') ? maxAge : ONE_WEEK;
        const expireAt = new Date((new Date()).getTime() + localMaxAge);
        const updatedDoc = await this.findByIdAndUpdate(key, {sessionData: sess, expireAt}, {new: true, upsert: true}).exec();
        return updatedDoc.sessionData;
    },
    destroy: async function destroySessionInStore(key) {
        const removedDoc = await this.findByIdAndRemove(key).exec();
        return removedDoc.sessionData;
    }
});

export default mongoose.model('Session', sessionSchema);