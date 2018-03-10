<template lang="pug">
    div
        a.btn.btn-primary(type="button", :href="downloadDumpUrl")
            i.fa.fa-download.fa-fw(aria="hidden")
            span._margin-5._left {{'Download database dump' | get-text}}
</template>
<script>
    import routesMap from '../../../../config/routes-map.json';

    export default {
        name: 'options',
        data() {
            return {
                msg: 'Options page here'
            }
        },
        computed: {
            downloadDumpUrl() {
                return routesMap.dbDump;
            }
        },
        methods: {}
    }
</script>
<style lang="less">

</style>