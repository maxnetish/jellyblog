<template src="./posts.pug" lang="pug"></template>
<script>
    import resources from '../../../resources';

    export default {
        name: 'posts',
        data () {
            return {
                msg: 'Posts page here',
                posts: [],
                hasMore: false
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
                        this.hasMore = result.hasMore;
                    });
            },
            onToggleStatusButtonClick(post) {
                let update;
                let self = this;
                let currentStatus = post.status;
                switch (currentStatus) {
                    case 'PUB':
                        update = resources.post.unpublish;
                        break;
                    case 'DRAFT':
                        update = resources.post.publish;
                        break;
                    default:
                        update = resources.post.unpublish;
                }
                post.statusUpdating = true;
                update({id: post._id})
                    .then(response => {
                        post.statusUpdating = false;
                        switch (currentStatus) {
                            case 'PUB':
                                post.status = 'DRAFT';
                                break;
                            case 'DRAFT':
                                post.status = 'PUB';
                                break;
                        }
                    }, err => {
                        post.statusUpdating = false;
                        console.warn(`Toggle status failed: ${err}`);
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