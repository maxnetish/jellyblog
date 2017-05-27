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
            availableTags: [],
            tagsIsLoading: false,
            availableTitleImages: []
        }
    },
    props: {
        id: {
            type: String,
            'default': null
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
                    self.availableTags = tagsWithCount.map(o => o.tag);
                    self.tagsIsLoading = false;
                });
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
        onTitleImageSelectSearch (e) {

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