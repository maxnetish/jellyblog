import moment from "moment";
import 'moment/locale/ru';

function createFilter(language = 'en') {
    return function getLocaleDatetimeString(date = new Date(), format = 'LL') {
        if (!date) {
            return null;
        }
        moment.locale(language);
        return moment(date).format(format);
    };
}

export {
    createFilter as createLocaleDatetimeFilter
};