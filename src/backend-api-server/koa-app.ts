// @ts-ignore
import Koa from 'koa';
import {router as echoRouter} from './echo/echo';

const app = new Koa();

app.use(echoRouter.routes());

export {
    app
}
