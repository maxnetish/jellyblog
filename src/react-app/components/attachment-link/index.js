import React                from 'react';

import fileStoreConfig      from '../../../../config/file-store.json';

const contentTypeToShowInline = /^(image|video|text)\//;

function AttachmentLink(props) {
    let f = props.attachment;

    if (!f) {
        return null;
    }

    let targetAttr = contentTypeToShowInline.test(f.contentType) ? '_blank' : undefined;
    let downloadAttr = contentTypeToShowInline.test(f.contentType) ? undefined : f.metadata.originalName;

    return <a
        href={`${fileStoreConfig.gridFsBaseUrl}/${f.filename}`}
        target={targetAttr}
        download={downloadAttr}
        type={f.contentType}
    >
        <b>{f.metadata.originalName}</b>
    </a>;
}

export default AttachmentLink;

