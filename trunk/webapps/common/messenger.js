/**
 * Created by Gordeev on 26.07.2014.
 */
define('messenger',
    [
        '_'
    ],
    function (_) {
        'use strict';
        var subscribes = {},

            addSubscribe = function (messageName, callback, once, context, state, async) {
                var options = {},
                    newSubscribe;

                if (_.isString(messageName)) {
                    options.messageName = messageName;
                    options.callback = callback;
                    options.once = once;
                    options.context = context;
                    options.state = state;
                    options.async = async;
                } else if (messageName) {
                    options = messageName;
                }

                newSubscribe = {
                    hash: _.uniqueId('m'),
                    callback: options.callback,
                    context: options.context,
                    once: !!options.once,
                    state: options.state,
                    async: !!options.async
                };

                if (!subscribes.hasOwnProperty(options.messageName)) {
                    subscribes[options.messageName] = [];
                }
                subscribes[messageName.messageName].push(newSubscribe);

                return newSubscribe.hash;
            },

            removeSubscribe = function (handler) {
                var messageToRemove,
                    indexToRemove = -1;

                messageToRemove = _.find(subscribes, function (subscribeMessage) {
                    indexToRemove = _.findIndex(subscribeMessage, function (subsc) {
                        return subsc.hash === handler;
                    });
                    return indexToRemove > -1;
                });
                if (indexToRemove > -1 && _.isArray(messageToRemove)) {
                    messageToRemove.splice(indexToRemove, 1);
                }
            },

            doPublish = function (messageName, args) {
                var onceSubscribes = [],
                    i,
                    iLen,
                    contextToUse,
                    subscribe,
                    subscribesForMessage;

                if (!subscribes.hasOwnProperty(messageName) || subscribes[messageName].length === 0) {
                    return;
                }

                subscribesForMessage = subscribes[messageName];

                for (i = 0, iLen = subscribesForMessage.length; i < iLen; i++) {
                    subscribe = subscribesForMessage[i];
                    contextToUse = subscribe.context || this;
                    if (subscribe.once) {
                        onceSubscribes.push(subscribe.hash);
                    }
                    if (subscribe.async) {
                        _.defer(subscribe.callback.call, contextToUse, args, subscribe.status);
                    } else {
                        subscribe.callback.call(contextToUse, args, subscribe.state);
                    }
                }

                _.remove(subscribesForMessage, function (subscr) {
                    return _.some(onceSubscribes, function (h) {
                        return h === subscr.hash;
                    });
                });
            },
            messageNames = Object.freeze({
                 TranslateLangChanged: 'jb_translate_lang_changed'
            });



        return {
            publish: doPublish,
            subscribe: addSubscribe,
            unSubscribe: removeSubscribe,
            messageNames: messageNames
        };
    });