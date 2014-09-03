/**
 * currently we use server detection
 */

define('mobile-detection',
    [

    ], function () {
        return {
            deviceMobile: !!window.jb_deviceMobile
        };
    });