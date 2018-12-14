import Router from 'koa-router';
import descriptors from './../resources/resources-descriptors';
import resources from './../resources';
import {get} from 'lodash';
import routesMap from "../../config/routes-map.json";

const defaultVerb = 'GET';
const router = Router({
    prefix: routesMap.api
});

function argsFromContext(ctx) {
    return Object.assign({}, ctx.body, ctx.state.query);
}

function addRoute(localRouter, descriptor) {
    if (!descriptor.url) {
        throw new Error('Resource url is not specified');
    }
    if (!descriptor.rpcPath) {
        throw new Error('Resource rpc path is not specified');
    }
    const methodVerb = (descriptor.method || defaultVerb).toLowerCase();
    const actualResourceFunc = get(resources, descriptor.rpcPath);
    if (!actualResourceFunc) {
        throw new Error(`Function ${descriptor.rpcPath} is not found in resources`);
    }
    localRouter[methodVerb](descriptor.rpcPath, descriptor.url, routeFunctionFactory(actualResourceFunc));
    return localRouter;
}

function routeFunctionFactory(resourceFunc) {
    return async function routeFunction(ctx) {
        const arg = argsFromContext(ctx);
        const resourceFuncContext = {
            xhr: true,
            user: ctx.state.user
        };
        // Inject context:
        ctx.body = await resourceFunc.call(resourceFuncContext, arg);
    };
}

descriptors.forEach(restDescriptor => {
    if (restDescriptor.url) {
        addRoute(router, restDescriptor);
    }
});

export default router;