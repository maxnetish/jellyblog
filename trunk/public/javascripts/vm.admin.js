/**
 * Created by Gordeev on 01.05.2014.
 */
define(["jquery", "ko", "underscore", "model.user"], function ($, ko, _, modelUser) {
    var userList = ko.observableArray(),
        init = function () {
            modelUser.getList(function (error, result) {
                if (!error) {
                    userList(result);
                }
            });

        };

    init();

    return{
        userList: userList
    };
});