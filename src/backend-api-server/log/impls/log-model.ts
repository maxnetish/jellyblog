import {Schema, model, Document} from 'mongoose';
import {ILogEntryDocument} from "../dto/log-entry-document";

const logSchema = new Schema({
        requestUrl: {
            type: String,
            required: false
        },
        requestMethod: {
            type: String,
            required: false
        },
        responseTime: {
            type: Number,
            required: true,
            default: 0
        },
        responseStatus: {
            type: String,
            required: false
        },
        referrer: {
            type: String,
            required: false
        },
        remoteAddress: {
            type: String,
            required: false
        },
        httpVersion: {
            type: String,
            required: false
        },
        userAgent: {
            type: String,
            required: false
        },
        userName: {
            type: String,
            required: false
        },
        date: {
            type: Date,
            required: true,
            default: new Date(),
            index: true
        },
        error: {
            type: String,
            required: false
        }
    },
    {
        capped: 8388608
    });

const LogModel = model<ILogEntryDocument>('Log', logSchema);

export {
    LogModel
}
