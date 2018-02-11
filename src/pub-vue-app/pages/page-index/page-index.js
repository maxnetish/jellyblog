import {mapState} from 'vuex';
import {getDefaultFiller} from "../../../utils/async-store-filler";
import {store as moduleStore, mutationTypes} from './store';
import Pagination from '../../components/pagination/pagination.vue';

const storeNamespace = 'page-index';


export default {
    name: "page-index",
    data() {
        return {};
    },
    computed: {
        ...mapState(storeNamespace, [
            'posts',
            'page',
            'hasMore',
            'errState'
        ])
    },
    components: {
        // 'component-header': ComponentPubHeader
        'component-pagination': Pagination
    },
    destroyed() {
        this.$store.unregisterModule(storeNamespace);
    },
    asyncData({store, route, beforeRouteUpdateHook = false, resources}) {
        console.log('Really fill store...');
        return getDefaultFiller({
            storeActionName: 'fetchPageData',
            storeNamespace,
            moduleStore
        })({
            store,
            route,
            beforeRouteUpdateHook,
            resources
        });
        // console.log('Store already filled');
        // return Promise.resolve(true);
    }
};