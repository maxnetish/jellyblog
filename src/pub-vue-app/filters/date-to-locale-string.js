// import moment from "moment";
// import 'moment/locale/ru';

import dateFnsFormat from 'date-fns/format';

function createFilter(language = 'en') {

    return Promise.all([
        import (
            /* webpackChunkName: "lang-date-",
            webpackMode: "lazy" */
            `date-fns/locale/${language}`
            ),
        import(
            /* webpackChunkName: "lang-",
            webpackMode: "lazy" */
            `../../i18n/${language}.json`
            )
    ])
        .then(imported => {
            let dateFnsLocale = imported[0];
            let appLocale = imported[1];

            return function getLocaleDatetimeString(date = new Date(), format = 'MMMM D YYYY') {
                let actualFormat = appLocale[format] || format;
                return dateFnsFormat(date, actualFormat, {locale: dateFnsLocale});
            };
        })
        .then(null, err => {
            return function getFallbackLocaleDatetimeString(date = new Date(), format = 'MMMM D YYYY') {
                return date.toLocaleString();
            };
        });


    // return import(
    //     /* webpackChunkName: "lang-date-",
    //     webpackMode: "lazy" */
    //     `date-fns/locale/${language}`
    //     )
    //     .then(locale => {
    //         return function getLocaleDatetimeString(date = new Date(), format = '') {
    //             dateFnsFormat()
    //         };
    //     });

    // return function getLocaleDatetimeString(date = new Date(), format = 'LL') {
    //
    //
    //
    //     if (!date) {
    //         return null;
    //     }
    //     moment.locale(language);
    //     return moment(date).format(format);
    // };
}

export {
    createFilter as createLocaleDatetimeFilter
};