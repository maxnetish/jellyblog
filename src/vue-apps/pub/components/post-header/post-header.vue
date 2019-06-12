<template lang="pug">
    .post-header-ct
        .post-header__title-img(v-if="post.titleImg")
            img(:src="post.titleImg.url")
        .post-header__content
            h1
                router-link(:to="post.url") {{post.title}}
            span.post-date-ct
                font-awesome-icon(:icon="iconCalendar", fixed-width)
                time.date(:datetime="post.createDate | date-to-iso-string") {{localeDatetime(post.createDate)}}
            div.tags(v-if="post.tags && post.tags.length")
                span.post-tag-ct(v-for="tagInfo in post.tags")
                    router-link(:to="tagInfo.url")
                        font-awesome-icon(:icon="iconTag", fixed-width)
                        span.post-tag-label {{tagInfo.tag}}

</template>

<script>
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
    import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
    import {faTag} from '@fortawesome/free-solid-svg-icons/faTag';

    export default {
        name: "pub-post-header",
        props: {
            post: {
                type: Object,
                default: null
            }
        },
        computed: {
            iconCalendar() {
                return faCalendarAlt;
            },
            iconTag() {
                return faTag;
            }
        },
        date() {
            return {};
        },
        components: {
            FontAwesomeIcon
        }
    }
</script>

<style scoped>

</style>
