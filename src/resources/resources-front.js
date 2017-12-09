import request from 'superagent';
import descriptors from './resources-descriptors';
import set from 'lodash/set';
import routesConfig from '../../config/routes-map.json';

const defaultVerb = 'GET';
const verbsForJsonSend = ['POST', 'PUT'];

const resources = {};

function resourceFactory(descriptor) {
    let url = routesConfig.api + descriptor.url;
    let methodVerb = descriptor.method || defaultVerb;
    return function resourceFunction(arg) {
        let r = request(methodVerb, url);

        if (verbsForJsonSend.indexOf(methodVerb) > -1) {
            r = r
                .type('json')
                .accept('json')
                .send(arg);
        } else {
            r = r
                .accept('json')
                .query(arg);
        }

        r = r.then(res => res.body);

        return r;
    };
}

descriptors.forEach(descriptor => {
    if(descriptor.url) {
        set(resources, descriptor.rpcPath, resourceFactory(descriptor));
    }
});

export default resources;