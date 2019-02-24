import request from 'superagent';

/**
 *
 * @param canvas
 * @param url
 * @param context
 * @param originalFilename
 * @param metadata: {width, height}
 * @returns {Promise}
 */
function uploadCanvas({canvas, url, context, originalFilename, metadata}) {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(blob => {
                uploadBlob({blob, url, context, originalFilename, metadata})
                    .then(resolve, reject);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

function uploadBlob({blob, url, context, originalFilename, metadata}) {
    let formData = new FormData();

    formData.append('context', context);

    for (let key in metadata) {
        if (metadata.hasOwnProperty(key) && metadata[key]) {
            formData.append(key, '' + metadata[key]);
        }
    }

    // self.refs.fileInput.files[0].name

    formData.append(context, blob, originalFilename);

    return request
        .post(url)
        .send(formData)
        .then(res => {
            return Object.assign({}, res.body.files[context][0]);
        });
}

export default uploadCanvas;
