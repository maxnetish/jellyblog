import resources from '../../../resources';
import AceEditor from '../../components/jb-vue-brace/jb-vue-brace.vue';
import MarkdownPreview from '../../components/jb-markdown-preview/jb-markdown-preview.vue';

export default {
    name: 'post',
    data () {
        return {
            post: {},
            contentMode: 'EDIT'
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
        onSubmit(e) {
            console.info(e);
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
        'markdown-preview': MarkdownPreview
    }
}