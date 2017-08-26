import {dropdown, checkbox} from 'vue-strap';
import routesMap from '../../../../config/routes-map.json';
import resources from 'jb-resources';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import DialogUploadMixin from '../../components/dialog-upload-file/mixin';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import noop from '../../../utils/no-op';
import SearchBlock from './files-search-block.vue';
import {merge as queryMerge} from '../../../utils/query';
import {getText} from '../../filters';

export default {
    name: 'files',
    mixins: [DialogUploadMixin, DialogConfirmMixin, DialogAlertMixin],
    data() {
        return {
            files: [],
            hasMore: false,
            checkAll: false,
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
                    context: '',
                    contentType: '',
                    dateTo: '',
                    dateFrom: ''
                };
            }
        }
    },
    computed: {
        someChecked: function () {
            return this.files.some(p => p.checked);
        }
    },
    methods: {
        fetchPageData() {
            resources.file
                .find({
                    page: this.page,
                    context: this.searchParameters.context || undefined,
                    contentType: this.searchParameters.contentType || undefined,
                    dateTo: this.searchParameters.dateTo || undefined,
                    dateFrom: this.searchParameters.dateFrom || undefined,
                    withoutPostId: true
                })
                .then(result => {
                    this.files = result.items || [];
                    this.hasMore = result.hasMore;
                    this.checkAll = false;
                });
        },
        onRouteChanged(newVal, oldVal) {
            this.fetchPageData();
        },
        onCheckAllChanged(newVal, oldVal) {
            this.files.forEach(p => {
                p.checked = newVal;
            });
        },
        onFileCheckedCange(index) {
            // to recompute 'someChecked'
            this.$set(this.files, index, Object.assign({}, this.files[index]));
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
                    this.fetchPageData();
                })
                .then(null, noop);
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
            let self = this;
            let checkedIds = this.files.filter(f => f.checked).map(f => f.id);
            if (!checkedIds.length) {
                return;
            }
            this.showConfirm({
                message: getText('Remove one or more selected file(s) from server forever?'),
                title: getText('Remove files')
            })
                .then(() => {
                    return resources.file.remove({id: checkedIds});
                })
                .then(res => {
                    self.fetchPageData();
                })
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    self.showAlert({message: err});
                });
        }
    },
    created() {
        this.fetchPageData();
    },
    watch: {
        '$route': 'onRouteChanged',
        'checkAll': 'onCheckAllChanged'
    },
    components: {
        'dropdown': dropdown,
        'checkbox': checkbox,
        'jb-pagination': JbPagination,
        'search-block': SearchBlock
    }
}