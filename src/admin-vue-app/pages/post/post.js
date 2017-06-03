import resources from '../../../resources';
import AceEditor from '../../components/jb-vue-brace/jb-vue-brace.vue';
import MarkdownPreview from '../../components/jb-markdown-preview/jb-markdown-preview.vue';
import AddImage from '../../components/add-image/add-image.vue';
import {Component as VuedalComponent} from 'vuedals';
import Multiselect from 'vue-multiselect';

export default {
    name: 'post',
    data () {
        return {
            post: {},
            contentMode: 'EDIT',
            tagsFromServer: [],
            tagsJustAdded: [],
            tagsIsLoading: false,
            tagSelectOpen: false,
            availableTitleImages: [],
            titleImagesLoading: false,
            titleImageSelectOpen: false
        }
    },
    props: {
        id: {
            type: String,
            'default': null
        }
    },
    computed: {
        availableTags () {
            return this.tagsJustAdded.concat(this.tagsFromServer);
        }
    },
    methods: {
        fetchData() {
            // if id not setted, server returns model for new post
            resources.post
                .get({id: this.id})
                .then(result => {
                    this.post = result || {};
                });
        },
        onSubmitButtonClick(e) {
            resources.post
                .createOrUpdate(this.post)
                .then(response => this.post = response);
        },
        onTagSelectSearch (query) {
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
        onTagSelectOpen (e) {
            this.tagSelectOpen = true;
        },
        onTagSelectClose (e) {
            this.tagSelectOpen = false;
        },
        addPostTag (newTag) {
            this.tagsJustAdded.push(newTag);
            this.post.tags.push(newTag);
        },
        onAddTitleImageClick(e) {
            this.$emit('vuedals:new', {
                title: 'Modal title from client',
                props: {
                    imageWidth: 100,
                    imageHeight: 100,
                    scaleWidth: 150,
                    scaleMax: 10,
                    scaleStep: 0.2
                },
                component: AddImage,
                size: 'xs',
                dismissable: true,
                onClose: res => console.log(`Result from modal: ${res}`),
                onDismiss: () => console.log('Modal dismissed')
            });
        },
        getFileInfoLabel (attachmentInfo) {
            return attachmentInfo.metadata.originalName;
        },
        onTitleImageSelectOpen (e) {
            let self = this;
            this.promiseForTitleImages = this.promiseForTitleImages ||
                resources.file.find({context: 'avatarImage', max: 1000});
            this.titleImagesLoading = true;
            this.titleImageSelectOpen = true;
            this.promiseForTitleImages
                .then(response => {
                    self.availableTitleImages = response.items || [];
                    this.titleImagesLoading = false;
                });
        },
        onTitleImageSelectClose (e){
            this.titleImageSelectOpen = false;
        }
    },
    created () {
        this.fetchData()
    },
    watch: {
        '$route': 'fetchData'
    },
    components: {
        'ace-editor': AceEditor,
        'markdown-preview': MarkdownPreview,
        'vuedals': VuedalComponent,
        'multiselect': Multiselect
    }
}