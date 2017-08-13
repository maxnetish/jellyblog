import resources from 'jb-resources';
import AceEditor from '../../components/jb-vue-brace/jb-vue-brace.vue';
import MarkdownPreview from '../../components/jb-markdown-preview/jb-markdown-preview.vue';
import DialogAddImage from '../../components/dialog-add-image/dialog-add-image.vue';
import DialogUploadFile from '../../components/dialog-upload-file/dialog-upload-file.vue';
import Multiselect from 'vue-multiselect';
import uploadCanvas from '../../../utils/upload-image-from-canvas';
import {getText} from '../../filters';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import routesMap from '../../../../config/routes-map.json';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';

export default {
    name: 'post',
    mixins: [DialogAlertMixin, DialogConfirmMixin],
    data() {
        return {
            post: {},
            contentMode: 'EDIT',
            tagsFromServer: [],
            tagsJustAdded: [],
            tagsIsLoading: false,
            tagSelectOpen: false,
            titleImagesFromServer: [],
            titleImagesJustAdded: [],
            titleImagesLoading: false,
            titleImageSelectOpen: false,
            statusUpdating: false,
            routesMap: routesMap
        }
    },
    props: {
        id: {
            type: String,
            'default': null
        }
    },
    computed: {
        availableTags() {
            return this.tagsJustAdded.concat(this.tagsFromServer);
        },
        availableTitleImages() {
            return this.titleImagesJustAdded.concat(this.titleImagesFromServer);
        },
        dirty() {
            return !isEqual(this.post, this.postOriginal);
        }
    },
    methods: {
        fetchData() {
            // if id not setted, server returns model for new post
            resources.post
                .get({id: this.id})
                .then(result => {
                    this.post = result || {};
                    this.postOriginal = cloneDeep(this.post);
                });
        },
        onSubmit(e) {
            let self = this;
            let isCreateNew = !this.post._id;
            resources.post
                .createOrUpdate(this.post)
                .then(response => {
                    if (isCreateNew) {
                        self.$router.replace({name: 'post', query: {id: response._id}});
                    }
                    self.post = response;
                    self.postOriginal = cloneDeep(this.post);
                });
        },
        onTagSelectSearch(query) {
            let self = this;

            this.promiseForAvailableTags = this.promiseForAvailableTags ||
                resources.tag.list({statuses: ['PUB', 'DRAFT']});

            this.tagsIsLoading = true;

            this.promiseForAvailableTags
                .then(function (tagsWithCount) {
                    self.tagsFromServer = tagsWithCount.map(o => o.tag);
                    self.tagsIsLoading = false;
                });
        },
        onTagSelectOpen(e) {
            this.tagSelectOpen = true;
        },
        onTagSelectClose(e) {
            this.tagSelectOpen = false;
        },
        addPostTag(newTag) {
            this.tagsJustAdded.push(newTag);
            this.post.tags.push(newTag);
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
                dismisable: true,
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
                            self.titleImagesJustAdded.unshift(fileInfo);
                            self.post.titleImg = Object.assign({}, fileInfo);
                        }, err => console.warn(err));
                },
                onDismiss: () => console.log('Modal dismissed')
            })
        },
        getFileInfoLabel(attachmentInfo) {
            return attachmentInfo.metadata.originalName;
        },
        onTitleImageSelectOpen(e) {
            let self = this;
            this.promiseForTitleImages = this.promiseForTitleImages ||
                resources.file.find({context: 'avatarImage', max: 1000});
            this.titleImagesLoading = true;
            this.titleImageSelectOpen = true;
            this.promiseForTitleImages
                .then(response => {
                    self.titleImagesFromServer = response.items || [];
                    this.titleImagesLoading = false;
                });
        },
        onTitleImageSelectClose(e) {
            this.titleImageSelectOpen = false;
        },
        onClearTitleImageClick(e) {
            this.post.titleImg = null;
        },
        onRemoveTitleImageFromServerClick: function (fileInfo, e) {
            let self = this;

            this.showConfirm({
                message: getText('Remove image from server forever? Links in posts will can be broken.'),
                title: getText('Remove file')
            })
                .then(() => {
                    // remove image here
                    return resources.file.remove({id: fileInfo._id})
                        .then(() => {
                            let indexToRemove = self.titleImagesFromServer.findIndex(fi => fi._id === fileInfo._id);
                            if (indexToRemove > -1) {
                                self.titleImagesFromServer.splice(indexToRemove, 1);
                            }
                            if (self.post.titleImg && self.post.titleImg._id === fileInfo._id) {
                                self.post.titleImg = null;
                            }
                        })
                })
                .then(() => {
                    // remove local copy
                    let indexToRemove = self.titleImagesFromServer.findIndex(fi => fi._id === fileInfo._id);
                    if (indexToRemove > -1) {
                        self.titleImagesFromServer.splice(indexToRemove, 1);
                    }
                    if (self.post.titleImg && self.post.titleImg._id === fileInfo._id) {
                        self.post.titleImg = null;
                    }
                })
                .then(null, err => {
                    // err handler
                    if (err === 'NO') {
                        return;
                    }
                    self.showAlert({
                        message: err
                    });
                });
        },
        onRemoveAttachmentButtonClick(attachmentIndex) {
            let self = this;

            this.showConfirm({
                title: getText('Remove file'),
                message: getText('Remove attachment? File will be removed forever with post saving.')
            })
                .then(() => {
                    self.post.attachments.splice(attachmentIndex, 1);
                })
                .then(null, err=>{
                    if(err!=='NO') {
                        self.showAlert({message: err});
                    }
                });
        },
        onAddAttachmentButtonClick(e) {
            let self = this;

            if (!this.post._id) {
                this.showAlert({message: 'You should first save save new post'});
                return;
            }

            this.$vuedals.open({
                title: getText('Upload attachment'),
                props: {
                    context: 'attachment',
                    postId: this.post._id
                },
                component: DialogUploadFile,
                size: 'xs',
                dismisable: false,
                onClose: dialogResult => {
                    if (!dialogResult) {
                        return;
                    }
                    self.post.attachments = self.post.attachments || [];
                    self.post.attachments.unshift(Object.assign({}, dialogResult));
                }
            });
        },
        onToggleStatusButtonClick(e) {
            let update;
            let self = this;
            let currentStatus = this.post.status;
            switch (currentStatus) {
                case 'PUB':
                    update = resources.post.unpublish;
                    break;
                case 'DRAFT':
                    update = resources.post.publish;
                    break;
                default:
                    update = resources.post.unpublish;
            }
            this.statusUpdating = true;
            update({id: this.post._id})
                .then(response => {
                    self.statusUpdating = false;
                    switch (currentStatus) {
                        case 'PUB':
                            self.postOriginal.status = self.post.status = 'DRAFT';
                            break;
                        case 'DRAFT':
                            self.postOriginal.status = self.post.status = 'PUB';
                            break;
                    }
                }, err => {
                    self.statusUpdating = false;
                    console.warn(`Toggle status failed: ${err}`);
                });
        }
    },
    created() {
        this.fetchData()
    },
    watch: {
        '$route': 'fetchData'
    },
    components: {
        'ace-editor': AceEditor,
        'markdown-preview': MarkdownPreview,
        'multiselect': Multiselect
    }
}