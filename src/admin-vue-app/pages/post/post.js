import resources from '../../../resources';

export default {
    name: 'post',
    data () {
        return {
            post: {}
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
    }
}