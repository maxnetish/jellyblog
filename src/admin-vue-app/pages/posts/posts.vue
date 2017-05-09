<template src="./posts.pug" lang="pug"></template>
<script>
    import resources from '../../../resources';

    export default {
        name: 'posts',
        data () {
            return {
                msg: 'Posts page here',
                posts: []
            }
        },
        props: {
            page: {
                type: Number,
                default: 1
            }
        },
        methods: {
            fetchPageData() {
                resources.post
                    .list({page: this.page, statuses: ['PUB', 'DRAFT']})
                    .then(result => {
                        this.posts = result.items || [];
                    });
            }
        },
        created () {
            this.fetchPageData()
        },
        watch: {
            '$route': 'fetchPageData'
        }
    }
</script>
<style lang="less">

</style>