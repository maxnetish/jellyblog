import {dropdown, checkbox} from 'vue-strap';
import routesMap from '../../../../config/routes-map.json';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import {merge as queryMerge} from '../../../utils/query';
import SearchBlock from './log-search-block.vue';
import {mapState} from 'vuex';
import {store as moduleStore, mutationTypes} from './store';
import {getDefaultFiller} from "../../../utils/async-store-filler";
import toInteger from "lodash/toInteger";

const storeNamespace = 'log';

function mapStoreNamespace(n) {
    return [storeNamespace, n].join('/');
}

export default {
    name: 'log',
    mixins: [DialogAlertMixin],
    data() {
        return {
            routesMap: routesMap
        }
    },
    props: {

    },
    computed: {
        ...mapState(storeNamespace, {
            logEntries: state => state.items,
            hasMore: 'hasMore'
        }),
        page: function () {
            return toInteger(this.$route.query.p) || 1;
        },
        routeSearchParameters: function () {
            return {
                err: !!this.$route.query.e,
                dateTo: this.$route.query.to,
                dateFrom: this.$route.query.from
            };
        }
    },
    methods: {
        onSearchSubmit(searchParameters) {
            let newQuery = queryMerge({
                newQuery: {
                    p: undefined,
                    e: searchParameters.withError ? 1 : undefined,
                    to: searchParameters.dateTo,
                    from: searchParameters.dateFrom
                },
                oldQuery: this.$route.query
            });
            this.$router.push({
                name: 'log',
                query: newQuery
            });
        },
        onErrorStateChanged(newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // clear error in state after dialog dismiss
            this.showAlert(newVal)
                .then(() => this.$store.commit(mapStoreNamespace(mutationTypes.ERROR), null));
        }
    },
    watch: {
        'errorState': 'onErrorStateChanged'
    },
    components: {
        'dropdown': dropdown,
        'checkbox': checkbox,
        'jb-pagination': JbPagination,
        'search-block': SearchBlock
    },
    destroyed() {
        this.$store.unregisterModule(storeNamespace);
    },
    asyncData({store, route, beforeRouteUpdateHook = false}) {
        return getDefaultFiller({
            moduleStore,
            storeNamespace,
            storeActionName: 'fetchPageData'
        })({
            store,
            route,
            beforeRouteUpdateHook
        });
    }
}