/**
 * Created by Gordeev on 27.07.2014.
 */
define('logger',
    [
        '_'
    ],
    function (_) {
        var log = function (data) {
            if (_.isString(data)) {
                console.log(data);
            } else {
                console.dir(data);
            }
        };

        return {
            log: log
        }
    });