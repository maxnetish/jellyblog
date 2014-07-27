/**
 * Created by Gordeev on 26.07.2014.
 */
define('data.mapper',
    [
        '_',
        'logger'
    ],
    function (_, logger) {
        var mapInternal = function (Model, data) {
            var plain,
                mappedData;

            try {
                plain = JSON.parse(data);
            } catch (err) {
                logger.log(err);
            }

            if (!plain) {
                return null;
            }

            if (_.isArray(plain)) {
                mappedData = _.map(plain, function (item) {
                    return new Model(item);
                });
            } else {
                mappedData = new Model(plain);
            }
            return mappedData;
        };

        var create = function (Model) {
            return function (data) {
                return mapInternal(Model, data);
            };
        }

        return {
            create: create
        }
    });