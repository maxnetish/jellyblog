var config = require('../config');

function createFileStoreModel(mongoose) {
    var schema = new mongoose.Schema({
        fileName: {
            type: String,
            required: true,
            index: true
        },
        uploadDate: {
            type: Date
        },
        uploader: {
            type: {}
        },
        category: {
            type: String,
            required: true,
            default: 'Other'
        },
        originalFileName: {
            type: String
        },
        mimeType: {
            type: String
        },
        size: {
            type: Number,
            required: true,
            default: 0
        }
    });
    schema.virtual('url').get(function () {
        return config.fileStore.bindPath + '/' + this.fileName
    });

    return mongoose.model('FileStoreMeta', schema);
}

exports.createFileStoreModel = createFileStoreModel;
