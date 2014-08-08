/**
 * Created by Gordeev on 03.08.2014.
 */
define('vm.misc',
    [
        'ko',
        'jquery',
        '_',
        'model-state',
        'data.icons',
        'data.navlink',
        'data.settings'
    ],
    function (ko, $, _, ModelState, icons, providerNavlinks, providerSettings) {
        'use strict';
        var mainNavlinks = ko.observableArray(),
            footerNavlinks = ko.observableArray(),
            settings = ko.observable({}),
            mainNavlinksToShow = ko.computed({
                read: function () {
                    return _.filter(mainNavlinks(), function (item) {
                        return !ko.unwrap(item.willRemove);
                    });
                },
                deferEvaluation: true
            }),
            footerNavlinksToShow = ko.computed({
                read: function () {
                    return _.filter(footerNavlinks(), function (item) {
                        return !ko.unwrap(item.willRemove);
                    });
                },
                deferEvaluation: true
            }),
            modelStates = {
                mainNavlinks: new ModelState(mainNavlinks),
                footerNavlinks: new ModelState(footerNavlinks),
                settings: new ModelState()
            },
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
            getNavlinkModelStateByCateg = function (categ) {
                switch (categ) {
                    case 'main':
                        return modelStates.mainNavlinks;
                    case 'footer':
                        return modelStates.footerNavlinks;
                    default:
                        return null;
                }
            },
            mainNavlinksVisible = ko.observable(false),
            footerNavlinkVisible = ko.observable(false),
            settingsVisible = ko.observable(false),
            saving = ko.observable(false),
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
                            footer = _.filter(result, function (item) {
                                return item.category === 'footer';
                            });

                        mainNavlinks.removeAll();
                        footerNavlinks.removeAll();

                        ko.utils.arrayPushAll(mainNavlinks, main);
                        ko.utils.arrayPushAll(footerNavlinks, footer);

                        modelStates.mainNavlinks.clear();
                        modelStates.footerNavlinks.clear();
                    });
                providerSettings.get()
                    .done(function(result){
                        settings(result);
                        modelStates.settings.setModel(result);
                    });
            },
            navlinksUpdateOrder = function (navlinksArray) {
                var i, iLen;
                for (i = 0, iLen = navlinksArray.length; i < iLen; i++) {
                    navlinksArray[i].order(i);
                }
            },
            saveNavlinks = function (categ) {
                var observableToSave,
                    modelState,
                    promises = [];
                categ = categ || 'main';

                modelState = getNavlinkModelStateByCateg(categ);
                observableToSave = getNavlinksByCateg(categ);
                navlinksUpdateOrder(observableToSave());

                observableToSave.remove(function (item) {
                    return item.willRemove() && !item._id;
                });

                saving(true);

                _.each(observableToSave(), function (nl) {
                    if (nl.willRemove()) {
                        promises.push(providerNavlinks.remove(nl._id)
                            .done(function (result) {
                                observableToSave.remove(function (item) {
                                    return item._id === result._id;
                                });
                            }));
                    } else {
                        promises.push(providerNavlinks.save(nl)
                            .done(function (result) {
                                if (!nl._id) {
                                    nl._id = result._id;
                                }
                            }));
                    }
                });

                $.when.apply(null, promises)
                    .done(function () {
                        modelState.clear();
                    })
                    .always(function () {
                        saving(false);
                    });
            },
            activate = function () {
                updateViewData();
            };

        return{
            activate: activate,
            mainNavlinks: {
                formId: 'mainNavlinksForm',
                toggle: function () {
                    mainNavlinksVisible(!mainNavlinksVisible());
                },
                visible: mainNavlinksVisible,
                navlinks: mainNavlinksToShow,
                add: function () {
                    addNavlink('main');
                },
                save: function () {
                    saveNavlinks('main');
                },
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.mainNavlinks.pristine() || saving();
                    }
                }),
                icons: icons.available,
                remove: removeNavlink,
                up: function (navlink) {
                    up(navlink, 'main');
                },
                down: function (navlink) {
                    down(navlink, 'main');
                }
            },
            footerNavlinks: {
                formId: 'footerNavlinksForm',
                visible: footerNavlinkVisible,
                toggle: function () {
                    footerNavlinkVisible(!footerNavlinkVisible());
                },
                navlinks: footerNavlinksToShow,
                add: function () {
                    addNavlink('footer');
                },
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.footerNavlinks.pristine() || saving();
                    }
                }),
                icons: icons.available,
                remove: removeNavlink,
                up: function (navlink) {
                    up(navlink, 'footer');
                },
                down: function (navlink) {
                    down(navlink, 'footer');
                },
                save: function () {
                    saveNavlinks('footer');
                }
            },
            appSettings: {
                formId: 'settingsForm',
                settings: settings,
                visible: settingsVisible,
                toggle: function(){
                    settingsVisible(!settingsVisible());
                },
                save: function(){

                },
                saveDisabled: ko.computed({
                    read: function () {
                        return modelStates.settings.pristine() || saving();
                    }
                })
            }
        };
    });