<template lang="pug">
    nav(aria-label="Page navigation")
        ul.pager
            li.previous(:style="{visibility: page === 1 ? 'hidden' : 'visible'}")
                router-link(:to="prevPageLocation")
                    i.fa.fa-arrow-left.fa-fw(aria-hidden="true")
                    .
                        {{'Previous page' | get-text}}
            li.next(:style="{visibility: hasMore ? 'visible' : 'hidden'}")
                router-link(:to="nextPageLocation")
                    .
                        {{'Next page' | get-text}}
                    i.fa.fa-arrow-right.fa-fw(aria-hidden="true")
</template>
<script>
    import {merge as queryMerge} from '../../../../utils/query';

    export default {
        name: 'jb-pagination',
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
    };
</script>
<style lang="less">

</style>