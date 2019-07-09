// @ts-ignore
import Router from 'koa-router';
// @ts-ignore
import {routesMap} from "../../config/routes-map";

const router = new Router();

router.get('echo-service', routesMap.get('echo') || '', context => {
    context.body = 'Service up';
});

export {
    router
};

