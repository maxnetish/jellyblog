<template lang="pug" src="./pagination.pug"></template>

<script>
    import {merge as queryMerge} from '../../../utils/query';
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft';
    import faArrowRight from '@fortawesome/fontawesome-free-solid/faArrowRight';

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
        data() {
            return {};
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
            prevRel() {
                let relValues = ['prev'];
                if (this.page === 2) {
                    relValues.push('first');
                }
                return relValues.join(' ');
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
            },
            nextRel() {
                let relValues = ['next'];
                return relValues.join(' ');
            },
            iconArrowLeft() {
                return faArrowLeft;
            },
            iconArrowRight() {
                return faArrowRight;
            }
        },
        components: {
            FontAwesomeIcon
        }
    }
</script>

<style scoped>

</style>