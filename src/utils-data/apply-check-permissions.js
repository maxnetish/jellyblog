/**
 * check permission for resource methods
 * @param rpcCall - permit only call throw rpc interface
 * @param directCall - permit only direct call (not from webapi, also roles will be ignore)
 * @param roles - permit user with one of specified roles
 * @param resourceFn - decorated resource function
 */
function applyCheckPermissions({rpcCall = false, directCall = false, roles = [], resourceFn} = {}) {
    if (typeof resourceFn !== 'function') {
        throw new Error(`applyCheckPermissions should decorates only functions`);
    }

    return function applyCheckPermissionsWrapper(...args) {

        if (rpcCall && !this.xhr) {
            // allow only rpc call
            return Promise.reject(405); // Not allowed
        }

        if(directCall && this.xhr) {
            // allow only direct call
            return Promise.reject(403); // Forbidden
        }

        if (roles.length) {
            if (!(this.user && this.user.role && roles.indexOf(this.user.role) > -1)) {
                return Promise.reject(401);
            }
        }

        return resourceFn.apply(this, args);
    };

}

export default applyCheckPermissions;