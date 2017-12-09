import fileFind             from './file/find';
import fileRemove           from './file/remove';
import logGet               from './log/get';
import postCreateOrUpdate   from './post/createOrUpdate';
import postExport           from './post/export';
import postGet              from './post/get';
import postImport           from './post/import';
import postList             from './post/list';
import postPubGet           from './post/pubGet';
import postPublish          from './post/publish';
import postPubList          from './post/pubList';
import postRemove           from './post/remove';
import postUnpublish        from './post/unpublish';
import tagList              from './tag/list';

export default {
    file: {
        find: fileFind,
        remove: fileRemove
    },
    log: {
        get: logGet
    },
    post: {
        createOrUpdate: postCreateOrUpdate,
        'export': postExport,
        get: postGet,
        import: postImport,
        list: postList,
        pubGet: postPubGet,
        publish: postPublish,
        pubList: postPubList,
        remove: postRemove,
        unpublish: postUnpublish
    },
    tag: {
        list: tagList
    }
};