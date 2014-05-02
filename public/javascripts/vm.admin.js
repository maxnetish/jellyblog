/**
 * Created by Gordeev on 01.05.2014.
 */
define(["jquery", "ko"], function ($, ko) {
    var userList = ko.observableArray(),
        init = function () {
            $.ajax({
                dataType: "json",
                type: "GET",
                url: "api/userlist",
                complete: function (jqXHR, textStatus) {

                },
                error: function (jqXHR, textStatus, errorThrown) {

                },
                success: function (data, textStatus, jqXHR) {
                    userList(data.data || []);
                }
            });
        };

    init();

    return{
        userList: userList
    };
});