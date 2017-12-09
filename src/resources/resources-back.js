/**
 * Idea: in every resource method we will have request context (this.req)
 */

import descriptors from './resources-descriptors';
import resources from './index';
import {set, get} from 'lodash';

function resourceFactory({descriptor, req}) {
    if (!descriptor.rpcPath) {
        throw new Error('Resource rpc path is not specified');
    }
    let actualFunc = get(resources, descriptor.rpcPath);
    if (!actualFunc) {
        throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
    }
    return function (args) {
        let context = {
            xhr: false,
            req: req
        };
        return actualFunc.call(context, args);
    }
}

function ResourceBack (req) {
    let self = this;

    descriptors.forEach(descriptor => {
        // with or without url:
        set(self, descriptor.rpcPath, resourceFactory({descriptor, req}));
    });
}

export default ResourceBack;