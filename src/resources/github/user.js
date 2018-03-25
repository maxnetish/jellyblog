import {AggregateCache} from "../../models";
import request from 'superagent';

function fetch({accountId = null} = {}) {
    if(!accountId) {
        return Promise.reject(400);
    }
    let url = `https://api.github.com/users/${accountId}`;
    return request('GET', url)
        .accept('json')
        .then(res => res.body);
}

// ttl: 1h
export default AggregateCache.applyCache({key: 'GITHUB_USER', ttl: 3600000, aggregateFn: fetch});