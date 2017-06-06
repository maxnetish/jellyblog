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
    },
    {
        contentType: /pdf/,
        icon: 'fa-file-pdf-o'
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

export default contentTypeToIcon;