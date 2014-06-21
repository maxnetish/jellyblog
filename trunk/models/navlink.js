/**
 * Created by Gordeev on 21.06.2014.
 */
var createNavlinkModel = function (mongoose) {
    var Schema = mongoose.Schema;

    var navlinkSchema = new Schema({
        text: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                'main',
                'footer'
            ],
            default: 'main'
        },
        disabled: {
            type: Boolean,
            required: true,
            default: false
        },
        visible: {
            type: Boolean,
            required: true,
            default: true
        },
        icon: {
            type: String
        },
        order: {
            type: Number,
            required: true,
            default: 0
        },
        newWindow:{
            type: Boolean,
            required: true,
            default: false
        }
    });

    return mongoose.model('Navlink', navlinkSchema);
};
exports.createNavlinkModel = createNavlinkModel;