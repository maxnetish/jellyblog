<template lang="pug">
    article.post
        post-header(:post="post")
        div.content(v-if="mode==='PREVIEW'")
            div(v-html="post.preview")
            div.poet-read-more.tags(v-if="post.useCut")
                span.post-tag-ct
                    router-link(:to="post.url", :title="'Read more of ' + post.title")
                        i.fa.fa-fw.fa-caret-square-o-down(aria-hidden="true")
                        span {{'Read more' | get-text}}
        div.content(v-if="mode==='FULL'", v-html="post.content")
</template>

<script>
    import PostHeaderComponent from '../post-header/post-header.vue';

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
            }
        },
        data () {
            return {

            };
        },
        components: {
            'post-header': PostHeaderComponent
        }
    }
</script>

<style scoped>

</style>