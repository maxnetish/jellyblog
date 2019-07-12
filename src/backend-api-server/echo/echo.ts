import {routesMap} from './echo-routes-map';
import Router = require("koa-router");

const router = new Router();

router.get(routesMap.echo, context => {
    context.body = `Service up. User: ${JSON.stringify(context.state.user, null, 2)}`;
});

export {
    router
};

