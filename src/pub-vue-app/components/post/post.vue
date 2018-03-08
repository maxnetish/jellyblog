<template lang="pug">
    article.post
        post-header(:post="post")
        div.content(v-if="mode==='PREVIEW'")
            div(v-html="post.preview")
            div.poet-read-more.tags(v-if="post.useCut || user")
                span.post-tag-ct
                    router-link(v-if="post.useCut", :to="post.url", :title="'Read more of ' + post.title")
                        i.fa.fa-fw.fa-caret-square-o-down(aria-hidden="true")
                        span {{'Read more' | get-text}}
                    a(v-if="user", :href="editUrl")
                        i.fa.fa-pencil.fa-fw(aria-hidden="true")
                        span {{'Edit post' | get-text}}
        div.content(v-if="mode==='FULL'")
            div(v-html="post.content")
            div.poet-read-more.tags(v-if="user")
                span.post-tag-ct
                    a(:href="editUrl")
                        i.fa.fa-pencil.fa-fw(aria-hidden="true")
                        span {{'Edit post' | get-text}}

</template>

<script>
    import routesMap from '../../../../config/routes-map.json';
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
            }
        },
        components: {
            'post-header': PostHeaderComponent
        }
    }
</script>

<style scoped>

</style>