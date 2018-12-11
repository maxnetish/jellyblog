import Router from 'koa-router';
import koaSend from 'koa-send';
import path from "path";
import webpackConstants from "../../webpack-config/constants";

const router = new Router({
    prefix: webpackConstants.dirWWWAlias
});

router.get('staticAssets', '/:localPath*', async ctx => {
    return koaSend(ctx, ctx.params.localPath, {
        maxage: 1000 * 60 * 60,
        immutable: true,
        hidden: false,
        root: path.resolve(webpackConstants.dirWWW),
        // index: false,
        gzip: true,
        brotli: true,
        format: true,
        // setHeaders: (res, path, stats) => {},
        extensions: false
    });
});

export default router;