/**
 * Created by Gordeev on 13.06.2014.
 */
var _ = require('underscore');
var createPostModel = function (mongoose) {
    var Schema = mongoose.Schema;

    var postSchema = new Schema({
        title: {
            type: String
        },
        slug: {
            type: String,
            unique: true
        },
        content: {
            type: String
        },
        image: {
            // url
            type: String
        },
        featured: {
            type: Boolean,
            default: false
        },
        draft: {
            type: Boolean,
            default: true
        },
        metaTitle: {
            type: String
        },
        metaDescription: {
            type: String
        },
        date: {
            type: Date,
            index: true
        },
        tags: {
            type: [String]
        }
    });

    return mongoose.model("Post", postSchema);
};
exports.createPostModel = createPostModel;