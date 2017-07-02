<template lang="pug">
    form(name="jb-posts-search-form", @submit.prevent="onSubmit")
        .jb-form-ct
            .form-horizontal
                .form-group
                    label.col-sm-2.control-label {{ 'Full text search' | get-text }}
                    .col-sm-10
                        bs-input(v-model="fullTextQuery", :maxlength="64", :clear-button="true")
                .form-group
                    .text-right
                        button.btn.btn-primary(type="submit")
                            i.fa.fa-search.fa-fw(aria="hidden")
                            span._margin-5._left {{'Search' | get-text}}
</template>
<script>
    import {input} from 'vue-strap'

    export default {
        name: 'posts-search-block',
        props: {
            q: {
                type: String
            }
        },
        data() {
            return {
                fullTextQuery: null
            };
        },
        methods: {
            onSubmit(e){

            }
        },
        components: {
            'bs-input': input
        },
        watch: {
            'q': function (newVal) {
                this.fullTextSearch = newVal;
            }
        }
    };
</script>
<style lang="less">
</style>