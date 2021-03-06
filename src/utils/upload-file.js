import request from 'superagent';

function uploadFile({file, url, context, metadata}) {
    let formData = new FormData();

    formData.append('context', context);

    for (let key in metadata) {
        if (metadata.hasOwnProperty(key) && metadata[key]) {
            formData.append(key, '' + metadata[key]);
        }
    }

    formData.append(context, file, file.name);

    return request
        .post(url)
        .send(formData)
        .then(res => {
            if (res.body.files) {
                return Object.assign({}, res.body.files[context][0]);
            } else {
                return Object.assign({}, res.body);
            }
        });
}

export default uploadFile;
