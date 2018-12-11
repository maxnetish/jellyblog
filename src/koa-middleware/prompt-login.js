import url from "url";
import routesMap from "../../config/routes-map";

export default async function promptLogin(ctx, next) {
    if (ctx.isAuthenticated()) {
        // user already logged in
        await next();
        return;
    }

    // anonymous -> prompt to login
    const redirectUrl = url.parse(routesMap.login, true);
    redirectUrl.query = redirectUrl.query || {};
    redirectUrl.query.next = ctx.url;
    // 302 FOUND
    ctx.redirect(url.format(redirectUrl));
    // not call next()
}