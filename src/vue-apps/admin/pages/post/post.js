import AceEditor from '../../components/jb-vue-brace/jb-vue-brace.vue';
import MarkdownPreview from '../../components/jb-markdown-preview/jb-markdown-preview.vue';
import DialogAddImage from '../../components/dialog-add-image/dialog-add-image.vue';
import DialogUploadFileMixin from '../../components/dialog-upload-file/mixin';
import Multiselect from 'vue-multiselect';
import uploadCanvas from '../../../../utils/upload-image-from-canvas';
import {getText} from '../../filters';
import routesMap from '../../../../../config/routes-map.json';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
import {store as moduleStore, mutationTypes} from './store';
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
import {getDefaultFiller} from "../../../../utils/async-store-filler";

const storeNamespace = 'post-details.ts';
const contentModeOptions = ['EDIT', 'PREVIEW'];

function mapStoreNamespace(n) {
    return [storeNamespace, n].join('/');
}

export default {
    name: 'post-details.ts',
    mixins: [DialogAlertMixin, DialogConfirmMixin, DialogUploadFileMixin],
    data() {
        return {
            contentModeOptions: contentModeOptions,
            routesMap: routesMap
        }
    },
    props: {
        // all get from $route
    },
    computed: {
        ...mapState(storeNamespace, [
            'post-details.ts',
            'errorState',
            'titleImagesFromServer',
            'titleImagesJustAdded',
            'titleImagesLoading',
            'titleImageSelectOpen',
            'tagSelectOpen',
            'tagsFromServer',
            'tagsJustAdded',
            'tagsIsLoading',
            'allowReadOptions',
            'contentTypeOptions',
            'contentMode',
            'statusUpdating'
        ]),
        ...mapGetters(storeNamespace, [
            'availableTitleImages',
            'availableTags',
            'dirty'
        ])
    },
    methods: {
        ...mapMutations(storeNamespace, {
            onAllowReadChange: mutationTypes.POST_ALLOW_READ_OPTION_CHANGED,
            onHruInput: mutationTypes.POST_HRU_CHANGED,
            onTitleInput: mutationTypes.POST_TITLE_CHANGED,
            onContentTypeChange: mutationTypes.POST_CONTENT_TYPE_CHANGED,
            onContentModeChanged: mutationTypes.CONTENT_MODE_CHANGED
        }),
        onClearTitleImageClick(e) {
            this.$store.commit(mapStoreNamespace(mutationTypes.POST_TITLE_IMG_CHANGED));
        },
        onTitleImageInput(fileInfo) {
            this.$store.commit(mapStoreNamespace(mutationTypes.POST_TITLE_IMG_CHANGED), {fileInfo});
        },
        onTitleImageSelectOpen(e) {
            this.$store.dispatch(mapStoreNamespace('needTitleImages'));
            this.$store.commit(mapStoreNamespace(mutationTypes.TITLE_IMAGES_SELECT_OPEN_CHANGED), {open: true});
        },
        onTitleImageSelectClose(e) {
            this.$store.commit(mapStoreNamespace(mutationTypes.TITLE_IMAGES_SELECT_OPEN_CHANGED), {open: false});
        },
        onAddTitleImageClick(e) {
            let self = this;
            this.$vuedals.open({
                title: getText('Add title image'),
                props: {
                    imageWidth: 100,
                    imageHeight: 100,
                    scaleWidth: 150,
                    scaleMax: 10,
                    scaleStep: 0.2
                },
                component: DialogAddImage,
                size: 'xs',
                dismissable: true,
                onClose: dialogResult => {
                    if (!dialogResult) {
                        return;
                    }
                    uploadCanvas({
                        canvas: dialogResult.canvas,
                        context: 'avatarImage',
                        metadata: {
                            height: 100,
                            width: 100,
                            description: dialogResult.description
                        },
                        originalFilename: dialogResult.originalFilename,
                        url: routesMap.upload
                    })
                        .then(fileInfo => {
                            self.$store.commit(mapStoreNamespace(mutationTypes.TITLE_IMAGES_ADDED), {fileInfo});
                            return fileInfo;
                        })
                        .then(null, err => {
                            self.$store.commit(mapStoreNamespace(mutationTypes.ERROR), err);
                        });
                }
            });
        },
        onRemoveTitleImageFromServerClick: function (fileInfo, e) {
            let self = this;
            this.showConfirm({
                message: getText('Remove image from server forever? Links in posts will can be broken.'),
                title: getText('Remove file')
            })
                .then(() => self.$store.dispatch(mapStoreNamespace('removeTitleImageFromServer'), {fileInfo}))
                .then(null, err => {
                    // dialog 'NO' result only here can be, real err handling will work throw vuex store
                });

        },
        getFileInfoLabel(attachmentInfo) {
            return attachmentInfo.metadata.originalName;
        },
        onTagSelectOpen(e) {
            this.$store.commit(mapStoreNamespace(mutationTypes.TAG_SELECT_OPEN_CHANGED), {open: true});
        },
        onTagSelectClose(e) {
            this.$store.commit(mapStoreNamespace(mutationTypes.TAG_SELECT_OPEN_CHANGED), {open: false});
        },
        onTagSelectInput(tags) {
            this.$store.commit(mapStoreNamespace(mutationTypes.POST_TAGS_CHANGED), {tags});
        },
        onTagSelectSearch(query) {
            this.$store.dispatch(mapStoreNamespace('needTags'));
        },
        addPostTag(tag) {
            this.$store.commit(mapStoreNamespace(mutationTypes.TAG_ADDED), {tag});
        },
        onAddAttachmentButtonClick(e) {
            let self = this;

            if (!this.post._id) {
                this.showAlert({message: 'You should first save save new post'});
                return;
            }

            this.showUploadFileDialog({
                context: 'attachment',
                postId: this.post._id,
                title: getText('Upload attachment')
            })
                .then(attachmentInfo => {
                    self.$store.commit(mapStoreNamespace(mutationTypes.POST_ATTACHMENT_ADDED), {attachmentInfo});
                    return attachmentInfo;
                })
                .then(null, err => {
                    if (err === 'cancel') {
                        return;
                    }
                    self.$store.commit(mapStoreNamespace(mutationTypes.ERROR), err);
                });
        },
        onRemoveAttachmentButtonClick(attachmentIndex) {
            let self = this;

            this.showConfirm({
                title: getText('Remove file'),
                message: getText('Remove attachment? File will be removed forever with post saving.')
            })
                .then(() => {
                    self.$store.commit(mapStoreNamespace(mutationTypes.POST_ATTACHMENT_REMOVED), {attachmentIndex});
                    return true;
                })
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    self.$store.commit(mutationTypes.ERROR, err);
                });
        },
        onPostBriefInput(value) {
            this.$store.commit(mapStoreNamespace(mutationTypes.POST_BRIEF_CHANGED), {value});
        },
        onPostContentInput(value) {
            this.$store.commit(mapStoreNamespace(mutationTypes.POST_CONTENT_CHANGED), {value});
        },
        onToggleStatusButtonClick(e) {
            this.$store.dispatch(mapStoreNamespace('togglePostStatus'));
        },
        onSubmit(e) {
            let self = this;
            let isCreateNew = !this.post._id;
            this.$store.dispatch(mapStoreNamespace('submit'))
                .then(response => {
                    if (response && isCreateNew) {
                        self.$router.replace({name: self.$route.name, query: {id: response._id}});
                    }
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
        'ace-editor': AceEditor,
        'markdown-preview': MarkdownPreview,
        'multiselect': Multiselect
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
