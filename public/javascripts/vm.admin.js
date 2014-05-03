/**
 * Created by Gordeev on 01.05.2014.
 */
define(["jquery", "ko", "underscore", "model.user"], function ($, ko, _, modelUser) {
    var userList = ko.observableArray(),
        editedUser = ko.observable(null),
        init = function () {
            modelUser.getList(function (error, result) {
                if (!error) {
                    userList(result);
                }
            });

        },
        edit = function () {
            this.sec1 = ko.observable();
            this.sec2 = ko.observable();
            editedUser(this);
        },
        remove = function () {

        },
        create = function () {

        };


    init();

    return{
        userList: userList,
        edit: edit,
        remove: remove,
        create: create,
        editedUser: editedUser
    };
});