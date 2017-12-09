import {Router} from 'express';
import descriptors from './resources-descriptors';
import resources from './index';
import {get} from 'lodash';

const defaultVerb = 'GET';
const router = Router();

function argsFromRequest(req) {
    let result = Object.assign({}, req.body, req.query);
    return result;
}

function addRoute(localRouter, descriptor) {
    if (!descriptor.url) {
        throw new Error('Resource url is not specified');
    }
    if (!descriptor.rpcPath) {
        throw new Error('Resource rpc path is not specified');
    }
    let methodVerb = (descriptor.method || defaultVerb).toLowerCase();
    let actualResourceFunc = get(resources, descriptor.rpcPath);
    if (!actualResourceFunc) {
        throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
    }
    localRouter[methodVerb](descriptor.url, routeFunctionFactory(actualResourceFunc));
    return localRouter;
}

function routeFunctionFactory(resourceFunc) {
    return function routeFunction(req, res, next) {
        let arg = argsFromRequest(req);
        let resourceFuncContext = {
            xhr: true,
            req: req
        };

        // Inject context:
        return Promise.resolve(resourceFunc.call(resourceFuncContext, arg))
            .then(actualFuncResult => {
                return res.send(actualFuncResult);
            })
            .then(null, next);
    };
}

descriptors.forEach(restDescriptor => {
    if (restDescriptor.url) {
        addRoute(router, restDescriptor);
    }
});

export default router;