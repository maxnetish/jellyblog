/**
 * Created by Gordeev on 23.03.14.
 */


var createUserModel = function (mongoose) {
    var Schema = mongoose.Schema;
    var crypto = require('crypto');

    var encryptPassword = function (password, user) {
        var salt = user.salt;
        var result = crypto.createHmac('sha1', salt)
            .update(password)
            .digest('hex');
        return result;
    };

    var userSchema = new Schema({
        login: { type: String, unique: true },
        fullName: String,
        passwordHash: String,
        salt: String
    });

    userSchema.methods.checkPassword = function (passwordToCheck) {
        return encryptPassword(passwordToCheck, this) === this.passwordHash;
    };

    userSchema.methods.setPassword = function (plainPassword) {
        this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
        this.passwordHash = encryptPassword(plainPassword, this);
    };

    userSchema.methods.toPlainObject = function () {
        return{
            username: this.login,
            fullname: this.fullName,
            id: this._id.toHexString()
        };
    };

    return mongoose.model("User", userSchema);
};
exports.createUserModel = createUserModel;