/**
 * Idea: in every resource method we will have request context (this.req)
 */

import resourcesDescriptors from './resources-descriptors';
import resources from './index';
import {setWith, get} from 'lodash';

function resourceFnFactory({descriptor}) {
    return function resourceFn(...args) {
        const actualFunc = get(resources, descriptor.rpcPath);
        const context = this.context;
        if (!actualFunc) {
            throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
        }
        const actualContext = Object.assign({}, context, {
            // force property because ResourceBack have not to serve xhr requests throw web api
            xhr: false,
        });
        return actualFunc.call(actualContext, ...args);
    };
}

function setWithCustomizer(nsValue, key, nsObject) {
    if (!nsValue) {
        return {
            context: nsObject.context
        };
    }
}

class ResourcesBack {
    constructor({descriptors, context}) {
        this.context = context;
        descriptors.forEach(descriptor => setWith(this, descriptor.rpcPath, resourceFnFactory({descriptor}), setWithCustomizer));
    }
}

function createResources(context) {
    return new ResourcesBack({descriptors: resourcesDescriptors, context})
}

export {
    createResources as resourcesFactory
};

