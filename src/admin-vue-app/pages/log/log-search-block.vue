<template lang="pug">
    form(name="jb-log-search-form", @submit.prevent="onSubmit")
        .jb-form-ct
            .form-horizontal
                .form-group
                    label.col-sm-2.control-label {{'Date' | get-text}}
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateFrom", :lang="lang", :placeholder="'Date from' | get-text")
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateTo", :lang="lang", :placeholder="'Date to' | get-text")
                .form-group
                    label.col-sm-2.control-label
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        checkbox(v-model="withError", type="primary") {{'Entries with error message' | get-text}}
                .form-group
                    .text-right.col-sm-12
                        button.btn.btn-primary(type="submit")
                            i.fa.fa-search.fa-fw(aria="hidden")
                            span._margin-5._left {{'Search' | get-text}}
</template>
<script>
    import {checkbox, datepicker} from 'vue-strap';
    import {locale, getText} from '../../../i18n';

    export default {
        name: 'log-search-block',
        props: {
            initialWithError: {
                type: Boolean
            },
            initialDateFrom: {
                type: String
            },
            initialDateTo: {
                type: String
            }
        },
        data() {
            return {
                withError: this.initialWithError,
                dateFrom: this.initialDateFrom || '',
                dateTo: this.initialDateTo || '',
                lang: locale()
            };
        },
        methods: {
            onSubmit(e){
                this.$emit('searchSubmit', {
                    withError: this.withError,
                    dateFrom: this.dateFrom ? this.dateFrom : undefined,
                    dateTo: this.dateTo ? this.dateTo : undefined
                })
            }
        },
        components: {
//            'bs-input': input,
            'datepicker': datepicker,
            'checkbox': checkbox
        },
        watch: {
            'initialWithError': function(newVal) {
                this.withError = newVal;
            },
            'initialDateFrom': function (newVal) {
                this.dateFrom = newVal || '';
            },
            'initialDateTo': function (newVal) {
                this.dateTo = newVal || '';
            }
        }
    };
</script>
<style lang="less">
</style>