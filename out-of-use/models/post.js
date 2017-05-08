/**
 * Created by Gordeev on 13.06.2014.
 */
var _ = require('lodash'),
    //moment = require('moment'),
    URL = require('url'),
    CUT_LITERAL = '%CUT%',
    createPostModel = function (mongoose) {
        var Schema = mongoose.Schema;

        var postSchema = new Schema({
            title: {
                type: String
            },
            slug: {
                type: String,
                index: true
            },
            content: {
                type: String
            },
            image: {
                // full url
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

        postSchema.virtual('hasCut').get(function () {
            return -1 !== this.content.indexOf(CUT_LITERAL);
        });

        postSchema.virtual('contentCut').get(function () {
            var cutPos = this.content.indexOf(CUT_LITERAL);
            if (cutPos === -1) {
                return this.content;
            }
            return this.content.substring(0, cutPos);
        });

        postSchema.virtual('contentFull').get(function () {
            var cutPos = this.content.indexOf(CUT_LITERAL);
            if (cutPos === -1) {
                return this.content;
            }
            return this.content.substring(0, cutPos) + this.content.substring(cutPos + CUT_LITERAL.length);
        });

        return mongoose.model("Post", postSchema);
    };

exports.createPostModel = createPostModel;