<template lang="pug">
    article.post
        post-header(:post="post")
        div.content(v-if="mode==='PREVIEW'")
            div(v-html="post.preview")
            div.poet-read-more.tags(v-if="post.useCut || user")
                span.post-tag-ct
                    router-link(v-if="post.useCut", :to="post.url", :title="'Read more of ' + post.title")
                        font-awesome-icon(:icon="iconCaretSquareDown", fixed-width)
                        span {{getText('Read more')}}
                    a(v-if="user", :href="editUrl")
                        font-awesome-icon(:icon="iconEdit", fixed-width)
                        span {{getText('Edit post')}}
        div.content(v-if="mode==='FULL'")
            div(v-html="post.content")
            div.poet-read-more.tags(v-if="user")
                span.post-tag-ct
                    a(:href="editUrl")
                        font-awesome-icon(:icon="iconCaretSquareDown", fixed-width)
                        span {{getText('Edit post')}}

</template>

<script>
    import routesMap from '../../../../../config/routes-map.json';
    import PostHeaderComponent from '../post-header/post-header.vue';
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    import faCaretSquareDown from '@fortawesome/fontawesome-free-solid/faCaretSquareDown';
    import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';

    export default {
        name: "pub-post",
        props: {
            post: {
                type: Object,
                default: null
            },
            mode: {
                type: String,
                default: 'PREVIEW'
            },
            user: {
                type: Object,
                default: null
            }
        },
        data () {
            return {

            };
        },
        computed: {
            editUrl: function () {
                return `${routesMap.admin}#${routesMap.post}?id=${this.post._id}`;
            },
            iconCaretSquareDown(){
                return faCaretSquareDown;
            },
            iconEdit(){
                return faEdit;
            }
        },
        components: {
            'post-header': PostHeaderComponent,
            FontAwesomeIcon
        }
    }
</script>

<style scoped>

</style>