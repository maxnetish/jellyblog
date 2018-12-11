async function noCheck(ctx, next) {
    await next();
}

function checkPermissionKoaMiddlewareFactory({roles = []} = {}) {
    if(!(roles && roles.length)) {
        return noCheck;
    }

    return async function checkPermission(ctx, next) {
        if (ctx.state.user && ctx.state.user.role && roles.indexOf(ctx.state.user.role) === -1) {
            ctx.status = 403; // Forbidden
            // no next() - break downsream middleware queue
            return;
        }
        await next();
    };
}

export default checkPermissionKoaMiddlewareFactory;