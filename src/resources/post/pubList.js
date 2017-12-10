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
        preview: p.brief ? p.brief : contentConverter[p.contentType](p.content),
        useCut: !!p.brief,
        tags: p.tags.map(t => ({tag: t, url: urljoin(routesMap.tag, encodeURIComponent(t))}))
    };
}

function fetch({page = 1, postsPerPage = mongooseConfig.paginationDefaultLimit, tag, from, to, q} = {}) {
    page = parseInt(page, 10) || 1;

    let self = this;
    let projection = '_id contentType createDate updateDate pubDate titleImg title brief content tags hru';
    let opts = {
        // lean: true,
        skip: (page - 1) * postsPerPage,
        limit: postsPerPage + 1,
        sort: {createDate: 'desc'}
    };
    let condition = {
        status: 'PUB'
    };
    let sanitizedFrom = from ? new Date(from) : null;
    let sanitizedTo = to ? new Date(to) : null;
    let sanitizedQ = q ? q.substring(0, 64) : null;
    let sanitizedTag = tag ? tag.substring(0, 32) : null;
    let createDateCondition;


    if (sanitizedTag) {
        Object.assign(condition, {
            tags: sanitizedTag
        });
    }

    if (sanitizedFrom) {
        createDateCondition = Object.assign(createDateCondition || {}, {
            $gte: sanitizedFrom
        });
    }

    if (sanitizedTo) {
        createDateCondition = Object.assign(createDateCondition || {}, {
            $lte: sanitizedTo
        });
    }

    if (createDateCondition) {
        Object.assign(condition, {
            createDate: createDateCondition
        });
    }

    if (sanitizedQ) {
        // apply full text query
        Object.assign(condition, {
            $text: {
                $search: sanitizedQ,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        });
    }

    if(self.req.user) {
        Object.assign(condition, {
            $or: [
                {allowRead: 'FOR_ALL'},
                {allowRead: 'FOR_REGISTERED'},
                {allowRead: 'FOR_ME', author: self.req.user.userName}
            ]
        })
    } else {
        Object.assign(condition, {
            allowRead: 'FOR_ALL'
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