<template lang="pug">
    .add-image-component-ct
        .row._margin-5._bottom
            .col-sm-12
                .alert.alert-warning(role="confirm") {{props.message}}
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
            return {

            }
        },
        props: {
            'props': {
                type: Object,
                'default': {}
            }
        },
        methods: {
            onNoButtonClick(e){
                this.$emit('vuedals:close', 'NO');
            },
            onYesButtonClick(e){
                this.$emit('vuedals:close', 'YES');
            }
        }
    };
</script>
<style lang="less">
    .vue-avatar-ct {
        display: inline-block;
    }
</style>