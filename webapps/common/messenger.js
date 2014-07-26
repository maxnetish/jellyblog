/**
 * Created by Gordeev on 26.07.2014.
 */
define('messenger',
    [
        '_'
    ],
    function (_) {

        var subscribes = {};

        var addSubscribe = function (messageName, callback, once, context, state) {
            var newSubsribe = {
                hash: _.uniqueId('m'),
                callback: callback,
                context: context,
                once: !!once,
                state: state
            };

            if (!subscribes.hasOwnProperty(messageName)) {
                subscribes[messageName] = [];
            }
            subscribes[messageName].push(newSubsribe);

            return newSubsribe.hash;
        };

        var removeSubscribe = function (handler) {
            var messageToRemove,
                indexToRemove;

            messageToRemove = _.find(subscribes, function (subscribeMessage) {
                indexToRemove = _.findIndex(subscribeMessage, function (subsc) {
                    return subsc.hash === handler;
                });
                return indexToRemove > -1;
            });
            if (_.isArray(messageToRemove)) {
                messageToRemove.splice(indexToRemove, 1);
            }
        };

        var doPublish = function (messageName, args) {
            var onceSubscribes = [], i, iLen, contextToUse, subscribe;
            if (!subscribes.hasOwnProperty(messageName) || subscribes[messageName].length === 0) {
                return;
            }

            for (i = 0, iLen = subscribes[messageName].length; i < iLen; i++) {
                subscribe = subscribes[messageName][i];
                contextToUse = subscribe.context || this;
                if (subscribe.once) {
                    onceSubscribes.push(subscribe.hash);
                }
                subscribe.callback.call(contextToUse, args, subscribe.state);
            }

            _.remove(subscribes[messageName], function (subscr) {
                return _.some(onceSubscribes, function (h) {
                    return h === subscr.hash;
                });
            });
        };

        return {

        };
    });