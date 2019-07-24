<template lang="pug">
    section.main-content
        span(id="scroll-anchor")
        component-post(v-if="post", :post="post", mode="FULL", :user="user")
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import {getDefaultFiller} from "../../../../utils/async-store-filler";
    import {store as moduleStore, mutationTypes} from './store';
    import PostComponent from '../../components/post/post.vue';

    const storeNamespace = 'page-post';

    export default {
        name: "pub-post",
        data() {
            return {};
        },
        computed: {
            ...mapState(storeNamespace, [
                'post-details.ts',
                'errState'
            ]),
            ...mapGetters(storeNamespace, [
                'user'
            ])
        },
        components: {
            'component-post': PostComponent
        },
        methods: {
            onErrorStateChanged(newVal, oldVal) {
                // console.warn(`pub-post error: ${newVal}`);
            }
        },
        watch: {
            // 'errState': 'onErrorStateChanged'
        },
        destroyed() {
            this.$store.unregisterModule(storeNamespace);
        },
        scrollToAfterFetchData: '#scroll-anchor',
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
        }
    };
</script>

<style scoped>

</style>
