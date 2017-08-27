import {dropdown, checkbox} from 'vue-strap';
import DialogConfirm from '../../components/dialog-confirm/dialog-confirm.vue';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import resources from 'jb-resources';
import {getText} from '../../filters';
import saveAsJson from '../../../utils/save-obj-as-json-file';
import SearchBlock from './posts-search-block.vue';
import routesMap from '../../../../config/routes-map.json';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import {merge as queryMerge} from '../../../utils/query';

export default {
    name: 'posts',
    mixins: [DialogAlertMixin],
    data () {
        return {
            msg: 'Posts page here',
            posts: [],
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
                    fullText: '',
                    dateFrom: '',
                    dateTo: ''
                };
            }
        }
    },
    computed: {
        someChecked: function () {
            return this.posts.some(p => p.checked);
        }
    },
    methods: {
        onCheckAllChanged(newVal, oldVal) {
            this.posts.forEach(p => {
                p.checked = newVal;
            });
        },
        fetchPageData() {
            resources.post
                .list({
                    page: this.page,
                    statuses: ['PUB', 'DRAFT'],
                    q: this.searchParameters.fullText,
                    from: this.searchParameters.dateFrom,
                    to: this.searchParameters.dateTo
                })
                .then(result => {
                    this.posts = result.items || [];
                    this.checkAll = false;
                    this.hasMore = result.hasMore;
                });
        },
        publishPosts(posts) {
            let self = this;
            posts.forEach(p => {
                p.statusUpdating = true;
            });
            resources.post.publish({
                ids: posts.map(p => p._id)
            })
                .then(response => {
                    posts.forEach(post => {
                        post.statusUpdating = false;
                        post.status = 'PUB';
                    });
                }, err => {
                    posts.forEach(post => {
                        post.statusUpdating = false;
                    });
                    self.showAlert({message: `Set status failed: ${err}`});
                });
        },
        makeDraftPosts(posts) {
            let self = this;
            posts.forEach(p => {
                p.statusUpdating = true;
            });
            resources.post.unpublish({
                ids: posts.map(p => p._id)
            })
                .then(response => {
                    posts.forEach(post => {
                        post.statusUpdating = false;
                        post.status = 'DRAFT';
                    });
                }, err => {
                    posts.forEach(post => {
                        post.statusUpdating = false;
                    });
                    self.showAlert({message: `Set status failed: ${err}`});
                });
        },
        removePosts(posts) {
            let self = this;

            this.$vuedals.open({
                title: getText('Remove post'),
                props: {
                    message: posts.length > 1 ? getText(`Remove ${posts.length} selected posts from server forever? Also removes attached files.`) : getText('Remove post from server forever? Also removes attached files.')
                },
                component: DialogConfirm,
                size: 'xs',
                dismisable: false,
                onClose: dialogResult => {
                    if (dialogResult !== 'YES') {
                        return;
                    }
                    resources.post.remove({ids: posts.map(p => p._id)})
                        .then(response => {
                            self.fetchPageData();
                        }, err => self.showAlert({message: err}));
                }
            });
        },
        importPosts(posts) {
            resources.post
                .import({ids: posts.map(p => p._id)})
                .then(result => {
                    saveAsJson(result, 'imported.json');
                });
        },
        onToggleStatusButtonClick(post) {
            let update;
            let currentStatus = post.status;
            switch (currentStatus) {
                case 'PUB':
                    this.makeDraftPosts([post]);
                    break;
                case 'DRAFT':
                    this.publishPosts([post]);
                    break;
                default:
                    this.makeDraftPosts([post]);
            }
        },
        onRemovePostButtonClick (post) {
            this.removePosts([post]);
        },
        onPublishCheckedClick (e) {
            this.publishPosts(this.posts.filter(p => p.checked));
        },
        onMakeDraftCheckedClick (e) {
            this.makeDraftPosts(this.posts.filter(p => p.checked));
        },
        onImportToJsonClick (post) {
            this.importPosts([post]);
        },
        onImportCheckedToJsonClick (e) {
            this.importPosts(this.posts.filter(p => p.checked));
        },
        onRemoveCheckedClick (e) {
            this.removePosts(this.posts.filter(p => p.checked));
        },
        onPostCheckedCange (index) {
            // to recompute 'someChecked'
            this.$set(this.posts, index, Object.assign({}, this.posts[index]));
        },
        onSearchSubmit (searchParameters) {
            let newQuery = queryMerge({
                newQuery: {
                    p: undefined,
                    q: searchParameters.fullText,
                    from: searchParameters.dateFrom,
                    to: searchParameters.dateTo
                },
                oldQuery: this.$route.query
            });
            this.$router.push({
                name: 'posts',
                query: newQuery
            });
        },
        onRouteChanged (newVal, oldVal) {
            this.fetchPageData();
        },
        exportFromOldJsonClick(e) {
            this.$refs.exportFromOldJsonFileInput.click();
        },
        exportFromCurrentJsonClick (e) {
            this.$refs.exportFromCurrentJsonFileInput.click();
        },
        exportFromCurrentJsonFileInputChanged (e) {
            let self = this;
            let f = e.target.files[0];
            let reader = new FileReader();

            reader.onload = loadEvent => {
                let parsedFromFile;
                let promises = [];
                try {
                    parsedFromFile = JSON.parse(loadEvent.target.result) || [];
                } catch (err) {
                    this.showAlert({message: `Failed to parse json from file: ${err}`});
                }

                resources.post.export({posts: parsedFromFile})
                    .then(response => {
                        self.fetchPageData();
                    }, err => this.showAlert({message: err}));
            };

            // Read file as text .
            reader.readAsText(f);
        },
        exportFromOldJsonFileInputChanged(e){
            let self = this;
            let f = e.target.files[0];
            let reader = new FileReader();

            reader.onload = loadEvent => {
                let parsedFromFile;
                let mappedFromFile = [];
                let promises = [];
                try {
                    parsedFromFile = JSON.parse(loadEvent.target.result) || [];
                    mappedFromFile = parsedFromFile.map(oldPost => {
                        let newPost = {
                            status: 'DRAFT',
                            createDate: new Date(oldPost.date.$date),
                            title: oldPost.title,
                            content: oldPost.content || 'No content',
                            tags: oldPost.tags || [],
                            hru: oldPost.slug || undefined,
                        };
                        return newPost;
                    });
                } catch (err) {
                    this.showAlert({message: `Failed to parse json from file: ${err}`});
                }

                resources.post.export({posts: mappedFromFile})
                    .then(response => {
                        self.fetchPageData();
                    }, err => this.showAlert({message: err}));
            };

            // Read file as text .
            reader.readAsText(f);
        }
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
        'search-block': SearchBlock,
        'jb-pagination': JbPagination
    }
}