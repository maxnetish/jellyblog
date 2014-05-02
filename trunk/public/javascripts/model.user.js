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

            this.isDirty = false;

            this.username.subscribe(this.onChangeField, this);
            this.fullname.subscribe(this.onChangeField, this);
        };

        ModelUser.prototype.onChangeField=function(){
            this.isDirty=true;
        };

        ModelUser.prototype.update = function (callback) {
            $.ajax({
                dataType: "json",
                type: "POST",
                url: "api/user/",
                data: {
                    username: this.username(),
                    fullname: this.fullname(),
                    id: this.id()
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
                        callback(null, result);
                    }
                }
            });
        };

        ModelUser.prototype.delete = function () {

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