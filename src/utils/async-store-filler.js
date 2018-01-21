/**
 * function to implement hydration and initial data fetch.
 * See https://ssr.vuejs.org/ru/data.html.
 *
 * returned function have to call from such places:
 * 1. In server ssr to async prepare state before sync rendering:
 *      register store module, fill state
 * 2. In client beforeMount hook with preloaded state
 *      register store module
 * 3. In client beforeMount hook without preloaded state
 *      register store module, fill state
 * 4. In client beforeRouteUpdate hook
 *      fill state
 *
 * So we going to register store module if beforeRouteUpdateHook falsy,
 * fill state if there is no preloaded state
 *
 * @param moduleStore - vuex store options object {namespaced:true,state,getters,actions,mutations}
 * @param {String} storeNamespace - store namespace for moduleStore
 * @param {String} storeActionName - action name in moduleStore that should takes {route} as parameter and resolves
 * @returns {Function} - function ({store, route, resources, beforeRouteUpdateHook}), resources will be passed to store action
 * to use during server side store filling
 */
function getDefaultFiller({moduleStore, storeNamespace, storeActionName = 'fetchPageData'}) {

    return function defaultStoreFiller({store, route, resources, beforeRouteUpdateHook = false}) {
        const alreadyFetchData = !beforeRouteUpdateHook && !!store.state[storeNamespace];
        const mappedActionName = storeNamespace ? [storeNamespace, storeActionName].join('/') : storeActionName;

        if (!beforeRouteUpdateHook && storeNamespace && moduleStore) {
            store.registerModule(storeNamespace, moduleStore, {preserveState: !!store.state[storeNamespace]});
        }

        if (alreadyFetchData) {
            return Promise.resolve(true);
        }

        // fetch from server
        return store.dispatch(mappedActionName, {route, resources});
    };
}

export {
    getDefaultFiller
};