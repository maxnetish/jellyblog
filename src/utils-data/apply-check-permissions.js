/**
 * check permission for isomorphine resource methods
 * @param rpcCall - permit only call throw rpc interface
 * @param roles - permit user with one of specified roles
 * @param resourceFn - decorated isomorphine resource function
 */
function applyCheckPermissions({rpcCall = false, roles = [], resourceFn} = {}) {
    if (typeof resourceFn !== 'function') {
        throw new Error(`applyCheckPermissions should decorates only functions`);
    }

    return function applyCheckPermissionsWrapper(...args) {

        if (rpcCall && !this.xhr) {
            // allow only rpc call
            return Promise.reject(500);
        }

        if (roles.length) {
            if (!(this.req && this.req.user && this.req.user.role && roles.indexOf(this.req.user.role)) > -1) {
                return Promise.reject(401);
            }
        }

        return resourceFn.apply(this, args);
    };

}

export default applyCheckPermissions;