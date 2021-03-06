/**
 * DEPRECATED
 */

const global = (function () {
    return this;
})();

function convertDataUrl2Blob(dataUrl) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    let mimeString;
    let bytesArray;
    let i, iLen;
    let result;
    let dataUrlSplitted = dataUrl.split(',');

    if (dataUrlSplitted.length < 1) {
        throw new Error('There is strange dataUri');
        return;
    }

    if (dataUrlSplitted[0].indexOf('base64') >= 0) {
        byteString = global.atob(dataUrlSplitted[1]);
    } else {
        byteString = global.decodeURIComponent(dataUrlSplitted[1]);
    }

    // separate out the mime component
    mimeString = dataUrlSplitted[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    bytesArray = new Uint8Array(byteString.length);
    for (i = 0, iLen = byteString.length; i < iLen; i++) {
        bytesArray[i] = byteString.charCodeAt(i);
    }

    result = new Blob([bytesArray], {type: mimeString});

    return result;
}

// function uploadFileFromDataUrl(dataUrl, fileCategory, fileLocalName) {
//     var dataBlob = convertDataUrl2Blob(dataUrl);
//     var dfr = Q.defer();
//     fileCategory = fileCategory || 'avatar-image';
//     fileLocalName = fileLocalName || 'ava.png';
//
//     request
//         .post('/api/upload')
//         .attach(fileCategory, dataBlob, fileLocalName)
//         .end(function (err, result) {
//             if (err) {
//                 dfr.reject(err);
//                 return;
//             }
//             dfr.resolve(result.body);
//         });
//
//     return dfr.promise;
// }

export {
    convertDataUrl2Blob
};
