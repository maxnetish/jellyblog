/**
 * Created by Gordeev on 06.07.2014.
 */
var createSettingsModel = function (mongoose) {
    var Schema = mongoose.Schema;

    var schema = new Schema({
        authorDisplayName: {
            type: String,
            required: true,
            default: 'Admin'
        },
        authorDisplayBio: {
            type: String
        },
        authorTwitterScreenName: {
            type: String
        },
        authorAvatarUrl: {
            // full url
            type: String
        },
        footerAnnotation: {
            type: String
        },
        postsPerPage: {
            type: Number,
            required: true,
            default: 5
        },
        siteTitle: {
            type: String,
            required: true,
            default: 'Blog'
        },
        metaTitle: {
            type: String
        },
        metaDescription: {
            type: String
        },
        titleImageUrl: {
            // full url
            type: String
        }
    });

    return mongoose.model('Settings', schema);
};

exports.createSettingsModel = createSettingsModel;