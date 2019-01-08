/**
 * route hooks for correct load data for state (client side)
 * @param resources
 * @returns {Function}
 */

function getBeforeRouteUpdate({resources}) {
    return function updateStoreOnComponentBeforeRouteUpdate (to, from, next) {
        // hook calls only in client
        // 'this' here is component instance
        const {asyncData, name, scrollToAfterFetchData} = this.$options;
        const {$root} = this;
        if (asyncData) {
            Promise.resolve(asyncData({
                store: this.$store,
                route: to,
                beforeRouteUpdateHook: true,
                resources
            }))
                .then((res => {
                    if (res && scrollToAfterFetchData) {
                        $root.$emit('SCROLL_TO', scrollToAfterFetchData);
                    }
                    return res;
                }))
                .then(res => {
                    next();
                    return res;
                })
                .then(null, next);
        } else {
            next();
        }
    }
}

function getBeforeResolve({resources, router, store}) {
    return function updateStoreOnRouterBeforeResolve (to, from, next) {
        // We didn't have component instance here because instance is not created yet
        // so we get matched component descriptors
        const [matched, prevMatched] = [to, from].map(l => router.getMatchedComponents(l));
        const reallyActivatedComponents = (function () {
            let diffed = false;
            return matched.filter((component, index) => {
                return diffed || (diffed = (prevMatched[index] !== component));
            })
        })();

        if (!(reallyActivatedComponents && reallyActivatedComponents.length)) {
            return next();
        }

        return Promise.all(reallyActivatedComponents.map(component => {
            if (component.asyncData) {
                return component.asyncData({store, route: to, resources});
            }
        }))
            .then(() => {
                return next();
            })
            .then(null, next);
    };
}

/**
 * options: {resources, router, store}
 * @param Vue
 * @param options
 */
function install(Vue, options) {
    // const {resources, router, store} = options;

    const {router} = options;
    // fires when route changed and new instance of component created
    router.beforeResolve(getBeforeResolve(options));

    Vue.mixin({
        // hook will fire when route changed but component reuses from previous state
        beforeRouteUpdate: getBeforeRouteUpdate(options)
    });
}

export default {
    install: install
};