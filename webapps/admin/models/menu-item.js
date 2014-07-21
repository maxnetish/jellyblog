/**
 * Created by Gordeev on 21.07.2014.
 */
define('testModule', ['jquery', 'path', 'ko', '_', 'moment'], function ($, p, ko, _, moment) {
    var w = $('html');
    moment.lang('ru');
    return {
        html: w,
        pathObject: p,
        knockVersion: ko.version,
        lodashVersion: _.VERSION,
        formattedDate: moment(new Date()).format('LLLL')
    };
});