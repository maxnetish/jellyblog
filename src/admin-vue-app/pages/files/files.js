import {dropdown, checkbox} from 'vue-strap';
import routesMap from '../../../../config/routes-map.json';
import resources from 'jb-resources';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';

export default {
    name: 'files',
    data () {
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
                    uploadDateMax: '',
                    uploadDateMin: ''
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
                    uploadDateMax: this.searchParameters.uploadDateMax || undefined,
                    uploadDateMin: this.searchParameters.uploadDateMin || undefined
                })
                .then(result => {
                    this.files = result.items || [];
                    this.hasMore = result.hasMore;
                    this.checkAll = false;
                });
        },
        onRouteChanged (newVal, oldVal) {
            this.fetchPageData();
        },
        onCheckAllChanged(newVal, oldVal) {
            this.files.forEach(p => {
                p.checked = newVal;
            });
        },
        onFileCheckedCange (index) {
            // to recompute 'someChecked'
            this.$set(this.files, index, Object.assign({}, this.files[index]));
        },
    },
    created () {
        this.fetchPageData();
    },
    watch: {
        '$route': 'onRouteChanged',
        'checkAll': 'onCheckAllChanged'
    },
    components: {
        'dropdown': dropdown,
        'checkbox': checkbox,
        'jb-pagination': JbPagination
    }
}