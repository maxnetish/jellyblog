import {dropdown, checkbox} from 'vue-strap';
import routesMap from '../../../../config/routes-map.json';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import DialogUploadMixin from '../../components/dialog-upload-file/mixin';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import noop from '../../../utils/no-op';
import SearchBlock from './files-search-block.vue';
import {merge as queryMerge} from '../../../utils/query';
import {getText} from '../../filters';
import {mapState, mapGetters} from 'vuex';
import {store as moduleStore, mutationTypes} from './store';
import {getDefaultFiller} from "../../../utils/async-store-filler";
import toInteger from "lodash/toInteger";

const storeNamespace = 'files';

function mapStoreNamespace(n) {
    return [storeNamespace, n].join('/');
}

export default {
    name: 'files',
    mixins: [DialogUploadMixin, DialogConfirmMixin, DialogAlertMixin],
    data() {
        return {
            routesMap: routesMap
        }
    },
    props: {},
    computed: {
        ...mapState(storeNamespace, {
            files: state => state.items,
            hasMore: 'hasMore',
            checkAll: 'checkAll'
        }),
        ...mapGetters(storeNamespace, [
            'someChecked'
        ]),
        page: function () {
            return toInteger(this.$route.query.p) || 1;
        },
        routeSearchParameters: function () {
            return {
                context: this.$route.query.c,
                contentType: this.$route.query.t,
                dateTo: this.$route.query.to,
                dateFrom: this.$route.query.from
            };
        }
    },
    methods: {
        onCheckAllChanged({checked}) {
            this.$store.commit(mapStoreNamespace(mutationTypes.CHECK_ALL_CHANGED), {checked});
        },
        onFileCheckedChange({index, checked}) {
            // to recompute 'someChecked'
            this.$store.commit(mapStoreNamespace(mutationTypes.CHECK_FILE_CHANGED), {index, checked});
        },
        uploadNewFileButtonClick() {
            this.showUploadFileDialog({
                context: 'attachment',
                allowContextEdit: false
            })
                .then(fileInfo => {
                    if (!fileInfo) {
                        return;
                    }
                    this.$store.dispatch(mapStoreNamespace('fetchPageData'), {route: this.$route});
                });
        },
        onSearchSubmit(searchParameters) {
            let newQuery = queryMerge({
                newQuery: {
                    p: undefined,
                    from: searchParameters.dateFrom,
                    to: searchParameters.dateTo
                },
                oldQuery: this.$route.query
            });
            this.$router.push({
                name: 'files',
                query: newQuery
            });
        },
        removeCheckedFilesButtonClick() {
            let checkedIds = this.files.filter(f => f.checked).map(f => f.id);
            if (!checkedIds.length) {
                return;
            }

            this.showConfirm({
                message: getText('Remove one or more selected file(s) from server forever?'),
                title: getText('Remove files')
            })
                .then(() => {
                    return this.$store.dispatch(mapStoreNamespace('removeCheckedFiles'), {route: this.$route});
                })
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    this.$store.commit(mapStoreNamespace(mutationTypes.ERROR), err);
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
};