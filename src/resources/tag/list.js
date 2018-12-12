import {Post, AggregateCache} from '../../models';
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
    const allowDrafts = statuses.indexOf('DRAFT') > -1;
    let internMethod;

    if (allowDrafts && !this.xhr) {
        // allow only rpc call if qeury for drafts
        return Promise.reject(500);
    }

    if (allowDrafts && !this.user) {
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

    return internMethod({statuses, user: this.user})
        .then(enrichTags);
}

// ttl: 1h
export default AggregateCache.applyCache({key: 'TAGS', ttl: 3600000, aggregateFn: fetch});