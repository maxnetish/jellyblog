import {mapState} from 'vuex';
import ComponentPubHeader from './components/pub-header/pub-header.vue';
import ComponentSidebar from './components/pub-sidebar/pub-sidebar.vue';
import ComponentFooter from './components/pub-footer/pub-footer.vue';
import {getDefaultFiller} from '../utils/async-store-filler';

export default {
    name: "pub-vue-app",
    data() {
        return {};
    },
    computed: {
        ...mapState([
            'tags',
            'user',
            'errState'
        ])
    },
    components: {
        'component-header': ComponentPubHeader,
        'component-sidebar': ComponentSidebar,
        'component-footer': ComponentFooter
    },
    asyncData({store, route, beforeRouteUpdateHook = false, resources}) {
        if (!store.state.pageDataFetched) {
            console.log('Really fill store root store...');
            return getDefaultFiller({
                storeActionName: 'fetchPageData'
            })({
                store,
                route,
                beforeRouteUpdateHook,
                resources
            });
        }
        console.log('Root store already filled');
        return Promise.resolve(true);
    }
}