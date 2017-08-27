import {dropdown, checkbox} from 'vue-strap';
import routesMap from '../../../../config/routes-map.json';
import resources from 'jb-resources';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import noop from '../../../utils/no-op';
import {merge as queryMerge} from '../../../utils/query';
import {getText} from '../../filters';
import SearchBlock from './log-search-block.vue';

export default {
    name: 'log',
    mixins: [DialogAlertMixin],
    data() {
        return {
            logEntries: [],
            hasMore: false,
            routesMap: routesMap
        }
    },
    props: {
        page: {
            type: Number,
            default: 1
        },
        searchParameters: {
            type: Object,
            default: function () {
                return {
                    withError: false,
                    dateTo: '',
                    dateFrom: ''
                };
            }
        }
    },
    methods: {
        fetchPageData() {
            resources.log
                .get({
                    page: this.page,
                    err: this.searchParameters.withError ? 1 : undefined,
                    dateTo: this.searchParameters.dateTo,
                    dateFrom: this.searchParameters.dateFrom
                })
                .then(result => {
                    this.logEntries = result.items || [];
                    this.hasMore = result.hasMore;
                });
        },
        onRouteChanged(newVal, oldVal) {
            this.fetchPageData();
        },
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
        }
    },
    created() {
        this.fetchPageData();
    },
    watch: {
        '$route': 'onRouteChanged'
    },
    components: {
        'dropdown': dropdown,
        'checkbox': checkbox,
        'jb-pagination': JbPagination,
        'search-block': SearchBlock
    }
}