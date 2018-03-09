<template lang="pug">
    .jb-content-preview(v-html="html")
</template>
<script>
    import showdownConverter from '../../../utils/showdown-singleton-converter';

    export default {
        name: 'jb-markdown-editor',
        props: {
            'markdown': {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                html: ''
            };
        },
        watch: {
            markdown (newMarkdown) {
                this.html = showdownConverter.makeHtml(newMarkdown || '');
            }
        },
        mounted () {
            // didn't call during SSR
            this.html = showdownConverter.makeHtml(this.markdown);
        }
    };
</script>
<style lang="less">

</style>