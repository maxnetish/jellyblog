import mongoose from 'mongoose';

let logSchema = new mongoose.Schema({
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

export default mongoose.model('Log', logSchema);