<template lang="pug">
    section.main-content
        h4.tag-page-title
            span {{getText('Posts with tag ')}}
            q {{$route.params.tagId}}
        component-pagination(v-if="posts.length", :page="page", :hasMore="hasMore", routePageParam="page")
        component-post(v-for="post in posts", :key="post.id", :post="post", mode="PREVIEW", :user="user")
        component-pagination(v-if="posts.length", :page="page", :hasMore="hasMore", routePageParam="page")
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import {getDefaultFiller} from "../../../../utils/async-store-filler";
    import {store as moduleStore, mutationTypes} from './store';
    import Pagination from '../../components/pagination/pagination.vue';
    import PostComponent from '../../components/post/post.vue';

    const storeNamespace = 'page-tag';

    export default {
        name: "page-tag",
        data() {
            return {};
        },
        computed: {
            ...mapState(storeNamespace, [
                'posts',
                'page',
                'hasMore',
                'errState'
            ]),
            ...mapGetters(storeNamespace, [
                'user'
            ])
        },
        components: {
            // 'component-header': ComponentPubHeader
            'component-pagination': Pagination,
            'component-post': PostComponent
        },
        destroyed() {
            this.$store.unregisterModule(storeNamespace);
        },
        asyncData({store, route, beforeRouteUpdateHook = false, resources}) {
            return getDefaultFiller({
                storeActionName: 'fetchPageData',
                storeNamespace,
                moduleStore
            })({
                store,
                route,
                beforeRouteUpdateHook,
                resources
            });
            // console.log('Store already filled, ', storeNamespace);
            // return Promise.resolve(true);
        }
    };
</script>

<style lang="less" scoped>
.tag-page-title {
    padding: 10px;
    margin: 0;
}
</style>