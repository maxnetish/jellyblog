import {AggregateCache} from "../../models";
import request from 'superagent';

function fetch({url = null, query = {}} = {}) {
    if(!url) {
        return Promise.reject(400);
    }
    return request('GET', url)
        .query(query)
        .accept('json')
        .then(res => res.body);
}

// ttl: 1h
export default AggregateCache.applyCache({key: 'GITHUB_MISC', ttl: 3600000, aggregateFn: fetch});