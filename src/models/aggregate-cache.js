import mongoose from 'mongoose';
import moment from 'moment';
import hash from 'object-hash';

let aggregateCacheSchema = new mongoose.Schema({
    // _id
    key: {
        type: String,
        required: true,
        index: true,
        unique: true,
        maxlength: 64
    },
    expire: {
        type: Date,
        required: true,
        default: () => moment().add(1, 'days').toDate()
    },
    // Mixed field
    // See ".markModified()" - required for mixed fields
    data: {}
});

aggregateCacheSchema.static({
    applyCache: function ({key, ttl = 86400000, aggregateFn} = {}) {
        let selfModel = this;

        return function aggregateFnWithCache(...args) {
            let self = this;
            // We should take into account some props in current context becouse aggregateFn will use it
            let cacheHash = hash({
                key: key,
                params: args,
                user: self.req && self.req.user
            });
            let dtNow = new Date();

            return selfModel.findOne({key: cacheHash}).exec()
                .then(finded => {
                    if (finded && finded.expire > dtNow) {
                        // cache clear
                        return {finded, data: finded.data, cacheActual: true};
                    } else {
                        // cache dirty -> update and return fresh data
                        return aggregateFn.apply(self, args).then(res => ({finded, data: res, cacheActual: false}));
                    }
                })
                .then(freshOrCached => {
                    if (freshOrCached.cacheActual) {
                        // update not needed
                        return freshOrCached;
                    } else {
                        freshOrCached.finded = freshOrCached.finded || new selfModel({key: cacheHash});
                        freshOrCached.finded.expire = moment(dtNow).add(ttl, 'ms');
                        freshOrCached.finded.data = freshOrCached.data;
                        return freshOrCached.finded.save().then(res => freshOrCached);
                    }
                })
                .then(freshOrCached => {
                    return freshOrCached.data;
                });
        }
    }
});

export default mongoose.model('AggregateCache', aggregateCacheSchema);