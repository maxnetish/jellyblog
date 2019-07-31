import {model, Schema} from "mongoose";
import moment = require("moment");
import {IAggregateCacheRecordDocument} from "../dto/aggregate-cache-record-document";

const schema = new Schema({
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

export const AggregateCacheModel = model<IAggregateCacheRecordDocument>('AggregateCache', schema);

