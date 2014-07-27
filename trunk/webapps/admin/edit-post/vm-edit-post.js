/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.edit-post',
    [
        'ko',
        'logger'
    ],
    function (ko, logger) {
        var currentPostId = ko.observable(undefined),
            post = ko.observable(undefined),
            updateViewData = function () {

            },
            activate = function (stateParams) {

            };

        return {
            activate: activate
        };
    });