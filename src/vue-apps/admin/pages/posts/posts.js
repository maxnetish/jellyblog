import {dropdown, checkbox} from 'vue-strap';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import resources from 'jb-resources';
import {getText} from '../../filters';
import saveAsJson from '../../../../utils/save-obj-as-json-file';
import SearchBlock from './posts-search-block.vue';
import routesMap from '../../../../../config/routes-map.json';
import JbPagination from '../../components/jb-pagination/jb-pagination.vue';
import {merge as queryMerge} from '../../../../utils/query';
import {store as moduleStore, mutationTypes} from './store';
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
import toInteger from 'lodash/toInteger';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
import {getDefaultFiller} from '../../../../utils/async-store-filler';

const storeNamespace = 'posts';

function mapStoreNamespace(n) {
    return [storeNamespace, n].join('/');
}

export default {
    name: 'posts',
    mixins: [DialogAlertMixin, DialogConfirmMixin],
    data() {
        return {
            routesMap: routesMap
        }
    },
    props: {},
    computed: {
        ...mapState(storeNamespace, {
            posts: state => state.items,
            hasMore: 'hasMore',
            checkAll: 'checkAll',
            someChecked: 'someChecked',
            errorState: 'errorState'
        }),
        ...mapGetters(storeNamespace, [
            'someChecked'
        ]),
        page: function () {
            return toInteger(this.$route.query.p) || 1;
        },
        routeSearchParameters: function () {
            return {
                fullText: this.$route.query.q,
                dateFrom: this.$route.query.from,
                dateTo: this.$route.query.to
            }
        }
    },
    methods: {
        ...mapMutations(storeNamespace, {
            onCheckAllChanged: mutationTypes.CHECK_ALL_CHANGED,
            onPostCheckedChange: mutationTypes.CHECK_POST_CHANGED
        }),
        ...mapActions(storeNamespace, [
            'fetchPageData',
            'publishCheckedPosts',
            'publishOnePost',
            'makeDraftCheckedPosts',
            'makeDraftOnePost',
            'removeCheckedPosts',
            'removeOnePost'
        ]),
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
                    this.makeDraftOnePost(post);
                    break;
                case 'DRAFT':
                    this.publishOnePost(post);
                    break;
                default:
                    this.makeDraftOnePost(post);
            }
        },
        onRemovePostButtonClick(post) {
            let self = this;

            this.showConfirm({
                message: getText('Remove post from server forever? Also removes attached files.'),
                title: getText('Remove post')
            })
                .then(() => self.removeOnePost({route: self.$route, _id: post._id}))
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    this.showAlert(err);
                });
        },
        onImportToJsonClick(post) {
            this.importPosts([post]);
        },
        onImportCheckedToJsonClick(e) {
            this.importPosts(this.posts.filter(p => p.checked));
        },
        onRemoveCheckedClick(e) {
            let self = this;
            let posts = this.posts.filter(p => p.checked);

            this.showConfirm({
                message: getText(`Remove ${posts.length} selected posts from server forever? Also removes attached files.`),
                title: getText('Remove post')
            })
                .then(() => self.removeCheckedPosts({route: self.$route}))
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    this.showAlert(err);
                });
        },
        onSearchSubmit(searchParameters) {
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
        onErrorStateChanged(newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // clear error in state after dialog dismiss
            this.showAlert(newVal)
                .then(() => this.$store.commit(mapStoreNamespace(mutationTypes.ERROR), null));
        },
        exportFromOldJsonClick(e) {
            this.$refs.exportFromOldJsonFileInput.click();
        },
        exportFromCurrentJsonClick(e) {
            this.$refs.exportFromCurrentJsonFileInput.click();
        },
        exportFromCurrentJsonFileInputChanged(e) {
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
                        self.fetchPageData({route: self.$route});
                    }, err => this.showAlert({message: err}));
            };

            // Read file as text .
            reader.readAsText(f);
        },
        exportFromOldJsonFileInputChanged(e) {
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
                        self.fetchPageData({route: self.$route});
                    }, err => this.showAlert({message: err}));
            };

            // Read file as text .
            reader.readAsText(f);
        }
    },
    created() {
        // this.fetchPageData({route: this.$route});
    },
    watch: {
        'errorState': 'onErrorStateChanged'
    },
    components: {
        'dropdown': dropdown,
        'checkbox': checkbox,
        'search-block': SearchBlock,
        'jb-pagination': JbPagination
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