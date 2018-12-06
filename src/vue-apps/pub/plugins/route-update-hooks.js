
function getBeforeCreate({resources}) {
    return function() {
        // Hook calls in client and server
        // We need this hook only in browser
        if (this.$isServer) {
            return;
        }
        const {asyncData, name, scrollToAfterFetchData} = this.$options;
        const {$root} = this;
        if (asyncData) {
            Promise.resolve(asyncData({
                store: this.$store,
                route: this.$route,
                resources
            }))
                .then((res) => {
                    if (res && scrollToAfterFetchData) {
                        $root.$emit('SCROLL_TO', scrollToAfterFetchData);
                    }
                    return res;
                });
        }
    };
}

function getBeforeRouteUpdate({resources}) {
    return function(to, from, next){
        // hook calls only in client
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

function install(Vue, options) {
    const {resources} = options;
    Vue.mixin({
        beforeCreate: getBeforeCreate({resources}),
        beforeRouteUpdate: getBeforeRouteUpdate({resources})
    });
}

export default {
    install: install
};