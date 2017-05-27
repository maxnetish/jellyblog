<template lang="pug">
    .add-image-component-ct
        .row
            .col-sm-12.text-center
                div.vue-avatar-ct
                    vue-avatar(:border="props.editorBorder",
                    :border-radius="props.imageBorderRadius",
                    :width="props.imageWidth",
                    :height="props.imageHeight",
                    ref="vueavatar",
                    @vue-avatar-editor:image-ready="onImageReady")
                    vue-avatar-scale(ref="vueavatarscale",
                    @vue-avatar-editor-scale:change-scale="onChangeScale",
                    :width="props.scaleWidth",
                    :min="props.scaleMin",
                    :max="props.scaleMax",
                    :step="props.scaleStep")
        .row
            .col-sm-12.text-right
                .btn-group(role="group")
                    button.btn.btn-default(@click="onCancelButtonClick")
                        i.fa.fa-ban.fa-fw(aria="hidden")
                        span {{'Cancel' | get-text}}
                    button.btn.btn-primary(@click="onOkButtonClick")
                        i.fa.fa-check.fa-fw(aria="hidden")
                        span {{'OK' | get-text}}
</template>
<script>
    /**
     * props:
     *      editorBorder: width of border in image editor
     *      imageBorderRadius,
     *      imageWidth,
     *      imageHeight,
     *      scaleWidth,
     *      scaleMin,
     *      scaleMax,
     *      scaleStep
     */

    import VueAvatar from '../../components/vue-avatar-editor/VueAvatar.vue';
    import VueAvatarScale from '../../components/vue-avatar-editor/VueAvatarScale.vue';

    export default {
        name: 'add-image',
        data () {
            return {
                imageSource: null
            }
        },
        props: {
            'props': {
                type: Object,
                'default': {}
            }
        },
        methods: {
            onChangeScale (scale) {
                this.$refs.vueavatar.changeScale(scale)
            },
            onImageReady (e) {
                console.log('Image ready');
            },
            onCancelButtonClick(e){
                this.$emit('vuedals:close');
            },
            onOkButtonClick(e){
                this.$emit('vuedals:close');
            }
        },
        components: {
            'vue-avatar': VueAvatar,
            'vue-avatar-scale': VueAvatarScale
        }
    };
</script>
<style lang="less">
    .vue-avatar-ct {
        display: inline-block;
    }
</style>