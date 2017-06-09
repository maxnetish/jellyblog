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
        preview: contentConverter[p.contentType](p.brief || p.content),
        useCut: !!p.brief,
        tags: p.tags.map(t => ({tag: t, url: urljoin(routesMap.tag, encodeURIComponent(t))}))
    };
}

function fetch({page = 1, postsPerPage = mongooseConfig.paginationDefaultLimit, tag, q} = {}) {
    page = parseInt(page, 10) || 1;

    let projection = '_id contentType createDate updateDate pubDate titleImg title brief content tags';
    let opts = {
        // lean: true,
        skip: (page - 1) * postsPerPage,
        limit: postsPerPage + 1,
        sort: {createDate: 'desc'}
    };
    let condition = {
        status: 'PUB'
    };

    if (tag) {
        Object.assign(condition, {
            tags: tag
        });
    }

    if (q) {
        // apply full text query
        Object.assign(condition, {
            $text: {
                $search: q,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        });
    }

    return Post.find(condition, projection, opts)
        .populate('titleImg')
        .exec()
        .then(findResult => {
            findResult = findResult || [];
            let findedLen = findResult.length;
            if (findedLen > postsPerPage) {
                findResult.splice(postsPerPage, findedLen - postsPerPage);
            }
            return {
                items: findResult.map(mapPost),
                hasMore: findedLen > postsPerPage,
                page: page,
                tag: tag
            };
        });
}

export default fetch;