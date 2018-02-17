<template lang="pug">
    .post-header-ct
        .post-header__title-img(v-if="post.titleImg")
            img(:src="post.titleImg.url")
        .post-header__content
            h1
                router-link(:to="post.url") {{post.title}}
            span.post-date-ct
                i.fa.fa-calendar.fa-fw(aria-hidden="true")
                time.date(:datetime="post.createDate | date-to-iso-string") {{post.createDate | locale-datetime}}
            div.tags(v-if="post.tags && post.tags.length")
                span.post-tag-ct(v-for="tagInfo in post.tags")
                    router-link(:to="tagInfo.url")
                        i.fa.fa-tag.fa-fw(aria-hidden="true")
                        span.post-tag-label {{tagInfo.tag}}

</template>

<script>
    export default {
        name: "pub-post-header",
        props: {
            post: {
                type: Object,
                default: null
            }
        },
        date(){
            return {};
        }
    }
</script>

<style scoped>

</style>