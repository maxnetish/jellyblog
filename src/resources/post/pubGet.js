import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import routesMap from '../../../config/routes-map.json';
import urljoin from 'url-join';
import showdown from 'showdown';

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
        tags: p.tags.map(t => ({tag: t, url: urljoin(routesMap.tag, encodeURIComponent(t))}))
    };
}

function fetch({id} = {}) {

    let projection = '_id status createDate pubDate updateDate contentType title content tags titleImg';

    let opts = {
        lean: false,
    };

    return Post.findById(id, projection, opts)
        .populate('titleImg')
        .exec()
        .then(res => {
            if(!res) {
                return Promise.reject(404);
            }
            if (res && res.status !== 'PUB') {
                return Promise.reject(404);
            }

            return mapPost(res);
        });
}

export default fetch;