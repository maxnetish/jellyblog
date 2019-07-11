import {routesMap} from './echo-routes-map';
import Router = require("koa-router");

const router = new Router();

router.get(routesMap.echo, context => {
    context.body = 'Service up';
});

export {
    router
};

