import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import routesMap from '../../../config/routes-map.json';
import urljoin from 'url-join';
import showdown from 'showdown';
import validObjectId from '../../utils/valid-object-id';

const showdownConverter = new showdown.Converter();

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

function fetch({id, allowDraft = false} = {}) {
    // FIXME: disallow rpc call to prevent anauthorized draft view
    let projection = '_id status createDate pubDate updateDate contentType title brief content tags titleImg hru';

    let opts = {
        lean: false,
    };

    let criteria = {
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
            if (res && res.status !== 'PUB' && !allowDraft) {
                return null;
            }

            return mapPost(res);
        });
}

export default fetch;