import {Post} from '../../models';
import routesMap from '../../../config/routes-map.json';
import urljoin from 'url-join';

function enrichTags(tagList) {
    let reducedResultWithUrl = tagList.map(item => {
        return Object.assign(item, {
            url: urljoin(routesMap.tag, encodeURIComponent(item.tag))
        });
    });
    return reducedResultWithUrl;
}

function fetch({statuses = ['PUB'], method = 'AGGREGATE'} = {}) {

    // TODO кешировать результат агрегации

    let self = this;
    let allowDrafts = statuses.indexOf('DRAFT') > -1;
    let internMethod;

    if (allowDrafts && !this.xhr) {
        // allow only rpc call if qeury for drafts
        return Promise.reject(500);
    }

    if (allowDrafts && !this.req.user) {
        // allow only authirized user query for drafts
        return Promise.reject(401);
    }

    switch (method) {
        case 'REDUCE':
            internMethod = Post.getTagListWithMapReduce.bind(Post);
            break;
        case 'AGGREGATE':
        default:
            internMethod = Post.getTagListWithAggregate.bind(Post);
            break;
    }

    return internMethod({statuses, user: this.req && this.req.user})
        .then(enrichTags);
}

export default fetch;