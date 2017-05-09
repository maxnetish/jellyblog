<template lang="pug">
    p {{msg}}, Pagination page: {{page}}
</template>
<script>
    import resources from '../../../resources';

    export default {
        name: 'posts',
        data () {
            return {
                msg: 'Posts page here'
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
                resources.post.list({page: this.page})
                    .then(result => console.info(result));
            }
        },
        created () {
            this.fetchPageData()
        },
        watch: {
            '$route': 'fetchPageData'
        },
    }
</script>
<style lang="less">

</style>