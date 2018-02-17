<template lang="pug">
    section.main-content
        span(id="scroll-anchor")
        component-post(v-if="post", :post="post", mode="FULL")
</template>

<script>
    import {mapState} from 'vuex';
    import {getDefaultFiller} from "../../../utils/async-store-filler";
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
                'post',
                'errState'
            ])
        },
        components: {
            'component-post': PostComponent
        },
        destroyed() {
            this.$store.unregisterModule(storeNamespace);
        },
        asyncData({store, route, beforeRouteUpdateHook = false, resources}) {
            console.log('Really fill store... ', storeNamespace);
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