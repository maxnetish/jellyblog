import Router from 'koa-router';
import {Buffer} from 'buffer';
import routesMap from "../../config/routes-map";
import path from "path";
import resolveVueServerRenderer from "../utils/resolve-vue-server-renderer";
import {promiseApp as promisePublicVueAppInServer} from "../vue-apps/pub/pub-client-server-entry";
import serializeJs from "serialize-javascript";

const router = new Router();
const autoRemove = process.env.NODE_ENV === 'production'
    ? ';(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());'
    : '';

router

    .get('robotsTxt', '/robots.txt', async ctx => {
        const robotsTxt = await ctx.backendResources.option.robotsGet();
        if (robotsTxt && robotsTxt.content && robotsTxt.allowRobots) {
            ctx.type = 'text/plain';
            ctx.body = Buffer.from(robotsTxt.content);
        } else {
            ctx.status = 404;
        }
    })

    .get('sitemap', routesMap.sitemap, async ctx => {
        const robotsTxt = await ctx.backendResources.option.robotsGet();
        const sitemap = (robotsTxt && robotsTxt.allowRobots) ? await ctx.backendResources.sitemap.generate() : null;
        if (sitemap && sitemap.content) {
            ctx.type = 'application/xml';
            ctx.body = sitemap.content;
        } else {
            ctx.status = 404;
        }
    })

    // isomorph app entry point
    .get('pubApp', '/*', async ctx => {
        const context = {url: ctx.url, resources: ctx.backendResources, language: ctx.state.language};
        const templateFileName =  path.join('views', 'pub', 'pub-ssr-template.html');
        const forRenderer = resolveVueServerRenderer({
            templateFileName,
            rendererOptions: {
                runInNewContext: 'once',
                inject: false
            }
        });
        const forPromisePublicVueAppInServer = promisePublicVueAppInServer(context);
        const renderer = await forRenderer;
        const {app, state} = await forPromisePublicVueAppInServer;
        const serialized = serializeJs(state, {isJSON: false});
        const encoded = btoa(serialized);
        const customState = `<script>window.__INITIAL_STATE__ = '${encoded}'${autoRemove}</script>`;
        const html = renderer.renderToString(app, Object.assign(context, res.locals, {customState}));
        ctx.body = html;
    });
;

export default router;