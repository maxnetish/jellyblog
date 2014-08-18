/**
 * Created by Gordeev on 13.06.2014.
 */
var _ = require('underscore'),
    moment = require('moment'),
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

        postSchema.methods.formatDate = function (locale, momentDateFormat) {
            var result;
            locale = locale || 'en';
            momentDateFormat = momentDateFormat || 'LL';
            result = moment(this.date).lang(locale).format(momentDateFormat);
            return result;
        };

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

        postSchema.virtual('url').get(function () {
            var result = {};

            if (this.slug) {
                result.pathname = '/post/' + this.slug;
                result.query = {};
            } else {
                result.pathname = '/post';
                result.query = {
                    id: this._id.toString()
                };
            }
            return result;
        });

        return mongoose.model("Post", postSchema);
    };

exports.createPostModel = createPostModel;