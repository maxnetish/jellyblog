import {Schema, model, Document} from 'mongoose';

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

interface ILogEntry extends Document {
    requestUrl?: string;
    requestMethod?: string;
    responseTime: number;
    responseStatus?: string;
    referrer?: string;
    remoteAddress?: string;
    httpVersion?: string;
    userAgent?: string;
    userName?: string;
    date: Date;
    error?: string;
}

const LogModel = model<ILogEntry>('Log', logSchema);

export {
    LogModel
}
