import TagsCloudComponent from '../tags-cloud/tags-cloud.vue';

export default {
    name: "pub-sidebar",
    props: {
        tags: {
            type: Array,
            default: []
        }
    },
    components: {
        'tags-cloud': TagsCloudComponent
    }
};