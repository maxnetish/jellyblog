<template lang="pug" src="./pagination.pug"></template>

<script>
    import {merge as queryMerge} from '../../../utils/query';

    export default {
        name: 'pub-pagination',
        props: {
            page: {
                type: Number,
                default: 1
            },
            hasMore: {
                type: Boolean,
                default: false
            },
            routePageParam: {
                type: String,
                default: 'p'
            }
        },
        data () {
            return {

            };
        },
        computed: {
            prevPageLocation: function () {
                let newQuery = queryMerge({
                    newQuery: {
                        [this.routePageParam]: this.page < 3 ? undefined : this.page - 1
                    },
                    oldQuery: this.$route.query
                });
                return {
                    name: this.$route.name,
                    query: newQuery,
                    params: this.$route.params
                };
            },
            nextPageLocation: function () {
                let newQuery = queryMerge({
                    newQuery: {
                        [this.routePageParam]: this.page + 1
                    },
                    oldQuery: this.$route.query
                });
                return {
                    name: this.$route.name,
                    query: newQuery,
                    params: this.$route.params
                };
            }
        }
    }
</script>

<style scoped>

</style>