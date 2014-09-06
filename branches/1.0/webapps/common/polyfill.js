/**
 * Created by mgordeev on 02.09.2014.
 */
define('polyfill',
    [

    ], function(){
    var add = function(){

        /**
         * string.startsWith:
         */
        if (!String.prototype.startsWith) {
            Object.defineProperty(String.prototype, 'startsWith', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (searchString, position) {
                    position = position || 0;
                    return this.lastIndexOf(searchString, position) === position;
                }
            });
        }
    };

    return {
        add: add
    };
});