<template lang="pug">
    .jb-content-preview(v-html="html")
</template>
<script>
    import showdown from 'showdown';
    const converter = new showdown.Converter();

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
                this.html = converter.makeHtml(newMarkdown || '');
            }
        },
        mounted () {
            // didn't call during SSR
            this.html = converter.makeHtml(this.markdown);
        }
    };
</script>
<style lang="less">

</style>