/**
 * DEPRECATED
 * not used now
 *
 * @type {boolean}
 */

const supportFileReader = typeof FileReader === 'function';

function convert(fileOrBlob) {
    return new Promise((resolve, reject) => {
        if(!supportFileReader){
            resolve(null);
        }
        if(!fileOrBlob){
            resolve(null);
        }

        let reader = new FileReader();

        reader.onloadend = () => resolve(reader.result);
        reader.onerror = err => reject(err);

        reader.readAsDataURL(fileOrBlob);
    });
}

export {
    convert as convertFileToDataUrl,
    supportFileReader as supports
};