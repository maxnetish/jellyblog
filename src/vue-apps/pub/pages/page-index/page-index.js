import {mapState, mapGetters} from 'vuex';
import {getDefaultFiller} from "../../../../utils/async-store-filler";
import {store as moduleStore, mutationTypes} from './store';
import Pagination from '../../components/pagination/pagination.vue';
import PostComponent from '../../components/post/post.vue';

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
        ]),
        ...mapGetters(storeNamespace, [
            'user'
        ])
    },
    components: {
        // 'component-header': ComponentPubHeader
        'component-pagination': Pagination,
        'component-post': PostComponent
    },
    destroyed() {
        this.$store.unregisterModule(storeNamespace);
    },
    asyncData({store, route, beforeRouteUpdateHook = false, resources}) {
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
    }
};