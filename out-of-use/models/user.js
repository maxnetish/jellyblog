/**
 * Created by Gordeev on 12.06.2014.
 */
var _ = require('lodash');
var createUserModel = function (mongoose) {
    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        openId: {type: String, unique: true},
        emails: {
            type: [String],
            get: function (val) {
                var res = _.map(val, function (elem) {
                    return {value: elem};
                });
                return res;
            },
            set: function (val) {
                var res = _.map(val, function (elem) {
                    return elem.value;
                });
                return res;
            }
        },
        displayName: {type: String}
    });

    userSchema.methods.toPlainObject = function () {
        return{
            openId: this.openId,
            emails: this.emails,
            displayName: this.displayName
        };
    };

    return mongoose.model("User", userSchema);
};
exports.createUserModel = createUserModel;