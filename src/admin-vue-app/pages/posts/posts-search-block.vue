<template lang="pug">
    form(name="jb-posts-search-form", @submit.prevent="onSubmit")
        .jb-form-ct
            .form-horizontal
                .form-group
                    label.col-sm-2.control-label {{ 'Full text search' | get-text }}
                    .col-sm-10
                        input.form-control(type="text", v-model="fullText", :maxlength="64")
                .form-group
                    label.col-sm-2.control-label {{ 'Create date' | get-text }}
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateFrom",:lang="lang", :placeholder="'Date from' | get-text")
                        span dateFrom: {{ new Date(dateFrom) }}
                    .col-lg-3.col-md-4.col-sm-5.col-xs-12
                        input.form-control(type="date", v-model="dateTo",:lang="lang", :placeholder="'Date from' | get-text")
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
            initialFullText: {
                type: String
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
                fullText: this.initialFullText || '',
                dateFrom: this.initialDateFrom || '',
                dateTo: this.initialDateTo || '',
                lang: locale(),
                datepickerFormat: getText('MM/dd/yyyy')
            };
        },
        methods: {
            onSubmit(e){
                this.$emit('searchSubmit', {
                    fullText: this.fullText ? this.fullText : undefined,
                    dateFrom: this.dateFrom ? this.dateFrom : undefined,
                    dateTo: this.dateTo ? this.dateTo : undefined
                })
            }
        },
        components: {
            'bs-input': input,
            'datepicker': datepicker
        },
        watch: {
            'initialFullText': function (newVal) {
                this.fullText = newVal || '';
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