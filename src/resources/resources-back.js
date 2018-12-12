/**
 * Idea: in every resource method we will have request context (this.req)
 */

import descriptors from './resources-descriptors';
import resources from './index';
import {set, get} from 'lodash';

function resourceFactory({descriptor, context}) {
    return function (args) {
        const actualFunc = get(resources, descriptor.rpcPath);
        if (!actualFunc) {
            throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
        }
        const actualContext = Object.assign({}, context, {
            // force property because ResourceBack have not to serve xhr requests throw web api
            xhr: false,
        });
        return actualFunc.call(actualContext, args);
    };
}

/**
 * context is structure that describe state when requesting: like {user, ...} - req in express, or ctx.state in koa
 * @param context
 * @constructor
 */
function ResourceBack(context) {
    const self = this;

    descriptors.forEach(descriptor => {
        if (!descriptor.rpcPath) {
            throw new Error('Resource rpc path is not specified');
        }
        // with or without url:
        set(self, descriptor.rpcPath, resourceFactory({descriptor, context}));
    });
}

export default ResourceBack;