import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import routesMap from '../../../config/routes-map.json';
import urljoin from 'url-join';
import showdownConverter from '../../utils/showdown-singleton-converter';
import validObjectId from '../../utils/valid-object-id';
import {applyCheckPermissions} from '../../utils-data';

const contentConverter = {
    'MD': content => showdownConverter.makeHtml(content),
    'HTML': content => content
};

function mapPost(p) {
    return {
        _id: p._id,
        url: p.url,
        createDate: p.createDate,
        updatedate: p.updateDate,
        pubDate: p.pubDate,
        titleImg: p.titleImg,
        title: p.title,
        content: contentConverter[p.contentType](p.content),
        description: p.brief,
        tags: p.tags.map(t => ({tag: t, url: urljoin(routesMap.tag, encodeURIComponent(t))}))
    };
}

function fetch({id = 'NO_ID'} = {}) {

    if (typeof id !== 'string') {
        // id have to be String
        return Promise.reject(400);
    }

    if (id.length === 0 || id.length > 64) {
        // id have to has len 1 to 64
        return Promise.reject(400);
    }

    const self = this;
    const projection = '_id status createDate pubDate updateDate contentType title brief content tags titleImg hru allowRead author';

    const opts = {
        lean: false,
    };

    const criteria = {
        $or: [{hru: id}]
    };

    if (validObjectId(id)) {
        criteria.$or.push({_id: id})
    }

    return Post.findOne(criteria, projection, opts)
        .populate('titleImg')
        .exec()
        .then(res => {
            if (!res) {
                return null;
            }
            const postPermission = Post.mapPermissions({post: res, user: self.user});
            if (!postPermission.allowView) {
                // нет разрешения на чтение:
                return Promise.reject({status: 401});
            }
            return mapPost(res);
        });
}

export default applyCheckPermissions({
    resourceFn: fetch
});
