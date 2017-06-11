<template src="./posts.pug" lang="pug"></template>
<script>
    import {dropdown} from 'vue-strap';
    import DialogConfirm from '../../components/dialog-confirm/dialog-confirm.vue';
    import resources from '../../../resources';
    import {getText} from '../../filters';

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
            },
            onRemovePostButtonClick (post) {
                let self = this;

                this.$vuedals.open({
                    title: getText('Remove post'),
                    props: {
                        message: getText('Remove post from server forever? Also removes attached files.')
                    },
                    component: DialogConfirm,
                    size: 'xs',
                    dismisable: false,
                    onClose: dialogResult => {
                        let self = this;
                        if (dialogResult !== 'YES') {
                            return;
                        }
                        resources.post.remove({id: post._id})
                            .then(response => {
                                self.fetchPageData();
                            }, err => console.warn(err));
                    }
                });
            },
            exportFromOldJsonClick(e) {
                this.$refs.exportFromOldJsonFileInput.click();
            },
            exportFromOldJsonFileInputChanged(e){
                let self = this;
                let f = e.target.files[0];
                let reader = new FileReader();

                reader.onload = loadEvent => {
                    let parsedFromFile;
                    let mappedFromFile = [];
                    let promises = [];
                    try {
                        parsedFromFile = JSON.parse(loadEvent.target.result) || [];
                        mappedFromFile = parsedFromFile.map(oldPost => {
                            let newPost = {
                                status: 'DRAFT',
                                createDate: new Date(oldPost.date.$date),
                                title: oldPost.title,
                                content: oldPost.content || 'No content',
                                tags: oldPost.tags || [],
                                hru: oldPost.slug || undefined,
                            };
                            return newPost;
                        });
                    } catch (err) {
                        console.warn(`Failed to parse json from file: ${err}`);
                    }

                    resources.post.export(mappedFromFile)
                        .then(response => {
                            console.info(`Export result: ${response}`);
                            self.fetchPageData();
                        }, err => console.warn(err));
                };

                // Read file as text .
                reader.readAsText(f);
            }
        },
        created () {
            this.fetchPageData()
        },
        watch: {
            '$route': 'fetchPageData'
        },
        components: {
            'dropdown': dropdown
        }
    }
</script>
<style lang="less">

</style>