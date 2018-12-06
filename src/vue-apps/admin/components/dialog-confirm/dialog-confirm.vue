<template lang="pug">
    .add-image-component-ct
        .row._margin-5._bottom
            .col-sm-12
                .alert.alert-warning(role="confirm") {{message}}
        .row
            .col-sm-12.text-right
                .btn-group(role="group")
                    button.btn.btn-default(@click="onNoButtonClick")
                        i.fa.fa-ban.fa-fw(aria="hidden")
                        span {{'Cancel' | get-text}}
                    button.btn.btn-primary(@click="onYesButtonClick")
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
            return {}
        },
        props: {
            'message': {
                type: String,
                default: 'Yes or no?'
            }
        },
        methods: {
            onNoButtonClick(e){
                this.$vuedals.close('NO');
            },
            onYesButtonClick(e){
                this.$vuedals.close('YES');
            }
        }
    };
</script>
<style lang="less">
</style>