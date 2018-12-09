/**
 * Idea: in every resource method we will have request context (this.req)
 */

import descriptors from './resources-descriptors';
import resources from './index';
import {set, get} from 'lodash';

function resourceFactory({descriptor, req: reqOrContextState}) {
    return function (args) {
        let actualFunc = get(resources, descriptor.rpcPath);
        if (!actualFunc) {
            throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
        }
        let context = {
            xhr: false,
            user: reqOrContextState.user
        };
        return actualFunc.call(context, args);
    };
}

function ResourceBack (reqOrContextState) {
    let self = this;

    descriptors.forEach(descriptor => {
        if (!descriptor.rpcPath) {
            throw new Error('Resource rpc path is not specified');
        }
        // with or without url:
        set(self, descriptor.rpcPath, resourceFactory({descriptor, req: reqOrContextState}));
    });
}

export default ResourceBack;