import {koaRoutesMap as routesMap} from "../koa-routes-map";
import Router = require("koa-router");

const router = new Router();

router.get('echo-service', routesMap.get('echo') || '', context => {
    context.body = 'Service up';
});

export {
    router
};

