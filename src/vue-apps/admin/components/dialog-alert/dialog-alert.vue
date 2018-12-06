<template lang="pug">
    div
        .row._margin-5._bottom
            .col-sm-12
                div(role="alert", :class="['alert', alertType]") {{ message }}
        .row
            .col-sm-12.text-right
                button.btn.btn-primary(@click="onOkButtonClick")
                    i.fa.fa-check.fa-fw(aria="hidden")
                    span {{'OK' | get-text}}
</template>
<script>
    /**
     * props:
     *      message
     */

    export default {
        name: 'dialog-confirm',
        data () {
            return {};
        },
        props: {
            'message': {
                type: String,
                default: 'Something goes wrong'
            },
            alertType: {
                type: String,
                default: 'alert-danger'
            }
        },
        methods: {
            onOkButtonClick(e){
                this.$vuedals.close('OK');
            }
        }
    };
</script>
<style lang="less">
</style>