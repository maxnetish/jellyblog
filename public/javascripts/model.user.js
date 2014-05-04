/**
 * Created by Gordeev on 02.05.2014.
 */
define(
    [
        "jquery",
        "underscore",
        "ko"
    ],
    function ($, _, ko) {
        var ModelUser = function (row) {
            row = row || {};

            row.username = row.username || null;
            row.fullname = row.fullname || null;
            row.id = row.id || null;

            this.username = ko.observable(row.username);
            this.fullname = ko.observable(row.fullname);
            this.id = ko.observable(row.id);

            this.sec1 = ko.observable();
            this.sec2 = ko.observable();

            this.usernameValid = ko.computed({
                read: this.usernameValidate,
                deferEvaluation: true,
                owner: this
            });
            this.fullnameValid = ko.computed({
                read: this.fullnameValidate,
                deferEvaluation: true,
                owner: this
            });
            this.sec1Valid = ko.computed({
                read: this.sec1Validate,
                deferEvaluation: true,
                owner: this
            });
            this.sec2Valid = ko.computed({
                read: this.sec2Validate,
                deferEvaluation: true,
                owner: this
            });
            this.allValid = ko.computed({
                read: this.allValidate,
                deferEvaluation: true,
                owner: this
            });
            // this.isDirty = false;

            this.username.subscribe(this.onChangeField, this);
            this.fullname.subscribe(this.onChangeField, this);
        };

        ModelUser.prototype.allValidate = function () {
            return this.usernameValid() && this.fullnameValid() && this.sec1Valid() && this.sec2Valid();
        };

        ModelUser.prototype.sec2Validate = function () {
            var sec1Unwrapped = this.sec1() || null,
                sec2Unwrapped = this.sec2() || null;
            if (sec1Unwrapped) {
                return sec1Unwrapped === sec2Unwrapped;
            } else {
                return true;
            }

        };

        ModelUser.prototype.sec1Validate = function () {
            var sec1Unwrapped = this.sec1() || null,
                idUnwrapped = this.id();

            if (idUnwrapped) {
                return _.isNull(sec1Unwrapped) || sec1Unwrapped.length > 5;
            } else {
                return _.isString(sec1Unwrapped) && sec1Unwrapped.length > 5;
            }
        };

        ModelUser.prototype.fullnameValidate = function () {
            var fullnameUnwrapped = this.fullname() || "";
            return fullnameUnwrapped.length < 256;
        };

        ModelUser.prototype.usernameValidate = function () {
            var usernameUnwrapped = this.username() || "";
            return usernameUnwrapped.length > 0 && usernameUnwrapped.length < 33;
        };

        ModelUser.prototype.clone = function () {
            return new ModelUser({
                username: this.username(),
                fullname: this.fullname(),
                id: this.id()
            });
        };

        ModelUser.prototype.onChangeField = function () {
            this.isDirty = true;
        };

        ModelUser.prototype.update = function (callback) {
            $.ajax({
                dataType: "json",
                type: "POST",
                url: "api/users",
                data: {
                    username: this.username(),
                    fullname: this.fullname(),
                    id: this.id(),
                    secret: this.sec1() || undefined
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (_.isFunction(callback)) {
                        callback(textStatus, null);
                    }
                },
                success: function (data, textStatus, jqXHR) {
                    var result = data.data || null;
                    result = new ModelUser(result);
                    if (_.isFunction(callback)) {
                        callback(data.error, result);
                    }
                }
            });
        };

        ModelUser.prototype.delete = function (callback) {
            $.ajax({
                dataType: "json",
                type: "DELETE",
                url: "api/users",
                data: {
                    id: this.id()
                },
                error: function(jqXHR, textStatus, errorThrown){
                    if(_.isFunction(callback)){
                        callback(textStatus, null);
                    }
                },
                success: function(data, textStatus, jqXHR){
                    var result = data.data || null;
                    result = new ModelUser(result);
                    if (_.isFunction(callback)) {
                        callback(data.error, result);
                    }
                }
            });
        };

        // callback(error, result) - nodejs style
        var getList = function (callback) {
            $.ajax({
                dataType: "json",
                type: "GET",
                url: "api/users",
                error: function (jqXHR, textStatus, errorThrown) {
                    if (_.isFunction(callback)) {
                        callback(textStatus, []);
                    }
                },
                success: function (data, textStatus, jqXHR) {
                    var userList = data.data || [];
                    userList = _.map(userList, function (row) {
                        return new ModelUser(row);
                    });
                    if (_.isFunction(callback)) {
                        callback(null, userList);
                    }
                }
            });
        };

        return{
            ModelUser: ModelUser,
            getList: getList
        }
    });