import Vue from 'vue';
import * as i18n from '../../i18n';

const lang = document.getElementsByTagName('html')[0].lang || 'en';
i18n.locale(lang);
function getLocaleText(key) {
    return i18n.getText(key);
}
Vue.filter('get-text', getLocaleText);

const contentTypeToIconMap = [
    {
        contentType: /image/,
        icon: 'fa-file-image-o'
    },
    {
        contentType: /text/,
        icon: 'fa-file-text-o'
    },
    {
        contentType: /opendocument/,
        icon: 'fa-file-text-o'
    },
    {
        contentType: /video/,
        icon: 'fa-file-video-o'
    },
    {
        contentType: /audio/,
        icon: 'fa-file-audio-o'
    }
];
const contentTypeToIconDefault = {
    contentType: 'default',
    icon: 'fa-file-o'
};
function contentTypeToIcon(contentType) {
    if (!contentType) {
        return contentTypeToIconDefault.icon;
    }

    let finded = contentTypeToIconMap.find(m => {
        return !!contentType.match(m.contentType);
    });

    if (finded) {
        return finded.icon;
    }

    return contentTypeToIconDefault.icon;
}
Vue.filter('content-type-to-icon', contentTypeToIcon);

export {
    getLocaleText as getText
};