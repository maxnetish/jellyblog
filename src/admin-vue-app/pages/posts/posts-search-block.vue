<template lang="pug">
    form(name="jb-posts-search-form", @submit.prevent="onSubmit")
        .jb-form-ct
            .form-horizontal
                .form-group
                    label.col-sm-2.control-label {{ 'Full text search' | get-text }}
                    .col-sm-10
                        input.form-control(type="text", v-model="fullTextQuery", :maxlength="64")
                .form-group
                    label.col-sm-2.control-label {{ 'Create date' | get-text }}
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateFromQuery",:lang="lang", :placeholder="'Date from' | get-text")
                        span dateFromQuery: {{ dateFromQuery }}
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateToQuery",:lang="lang", :placeholder="'Date from' | get-text")
                .form-group
                    .text-right.col-sm-12
                        button.btn.btn-primary(type="submit")
                            i.fa.fa-search.fa-fw(aria="hidden")
                            span._margin-5._left {{'Search' | get-text}}
</template>
<script>
    import {input, datepicker} from 'vue-strap';
    import {locale, getText} from '../../../i18n';

    export default {
        name: 'posts-search-block',
        props: {
            q: {
                type: String
            },
            from: {
                type: String
            },
            to: {
                type: String
            }
        },
        data() {
            return {
                fullTextQuery: null,
                dateFromQuery: '',
                dateToQuery: '',
                lang: locale(),
                datepickerFormat: getText('MM/dd/yyyy')
            };
        },
        methods: {
            onSubmit(e){
                this.$emit('searchSubmit', {
                    q: this.fullTextQuery,
                    from: this.dateFromQuery,
                    to: this.dateToQuery
                })
            }
        },
        components: {
            'bs-input': input,
            'datepicker': datepicker
        },
        watch: {
            'q': function (newVal) {
                this.fullTextSearch = newVal;
            },
            'from': function (newVal) {
                this.dateFromQuery = newVal || '';
            },
            'to': function (newVal) {
                this.dateToQuery = newVal || ''
            }
        }
    };
</script>
<style lang="less">
</style>