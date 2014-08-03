/**
 * Created by Gordeev on 03.08.2014.
 */
define('vm.misc',
    [
        'ko',
        '_',
        'logger',
        'data.icons',
        'data.navlink'
    ],
    function (ko, _, logger, icons, providerNavlinks) {
        var mainNavlinks = ko.observableArray()
                .extend({
                    rateLimit: 300
                }),
            footerNavlinks = ko.observableArray()
                .extend({
                    rateLimit: 300
                }),
            mainNavlinksToShow = ko.computed({
                read: function () {
                    return _.filter(mainNavlinks(), function (item) {
                        return !ko.unwrap(item.willRemove);
                    });
                },
                deferEvaluation: true
            }),
            footerNavlinksToShow = ko.computed({
               read: function(){
                   retun _.filter(footerNavlinks(), function(item){
                        return !ko.unwrap(item.willRemove);
                   });
               },
                deferEvaluation: true
            }),
            getNavlinksByCateg = function (categ) {
                switch (categ) {
                    case 'main':
                        return mainNavlinks;
                    case 'footer':
                        return footerNavlinks;
                    default:
                        return null;
                }
            },
            mainNavlinksVisible = ko.observable(false),
            footerNavlinkVisible = ko.observable(false),
            addNavlink = function (categ) {
                var arrayToAdd = getNavlinksByCateg(categ),
                    newNavlink = new providerNavlinks.Model({
                        category: categ
                    });
                arrayToAdd.push(newNavlink);
            },
            removeNavlink = function (navlink) {
                navlink.willRemove(true);
            },
            up = function (navlink, categ) {
                var arrayToMove = getNavlinksByCateg(categ),
                    indexToMove = arrayToMove.indexOf(navlink);

                if (indexToMove === 0 || arrayToMove().length < 2) {
                    return;
                }
                arrayToMove.splice(indexToMove, 1);
                arrayToMove.splice(indexToMove - 1, 0, navlink);
            },
            down = function (navlink, categ) {
                var arrayToMove = getNavlinksByCateg(categ),
                    indexToMove = arrayToMove.indexOf(navlink);
                if (arrayToMove().length < 2 || indexToMove === (arrayToMove().length - 1)) {
                    return;
                }
                arrayToMove.splice(indexToMove, 1);
                arrayToMove.splice(indexToMove + 1, 0, navlink);
            },
            updateViewData = function () {
                providerNavlinks.query()
                    .done(function (result) {
                        var main = _.filter(result, function (item) {
                            return item.category === 'main';
                        }),
                            footer = _.filteer(result, function(item){
                                return item.category === 'footr';
                            });

                        mainNavlinks.removeAll();
                        footerNavlinks.removeAll();

                        ko.utils.arrayPushAll(mainNavlinks, main);
                        ko.utils.arrayPushAll(footerNavlinks, footer);
                    });
            },
            activate = function () {
                updateViewData();
            };


        return{
            activate: activate,
            mainNavlinks: {
                toggle: function () {
                    mainNavlinksVisible(!mainNavlinksVisible());
                },
                visible: mainNavlinksVisible,
                navlinks: mainNavlinksToShow,
                add: function () {
                    addNavlink('main');
                },
                save: function () {
                },
                saveDisabled: false,
                icons: icons.available,
                remove: removeNavlink,
                up: function (navlink) {
                    up(navlink, 'main');
                },
                down: function (navlink) {
                    down(navlink, 'main')
                }
            }
        };
    });