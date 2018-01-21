<template lang="pug" src="./pub-footer.pug"></template>

<script>
    import routesMap from '../../../../config/routes-map.json';
    import url from 'url';

    export default {
        name: "pub-footer",
        props: {
            user: {
                type: Object,
                'default': null
            }
        },
        computed: {
            linkUrl() {
                let targetUrl = url.parse(this.user ? routesMap.logout : routesMap.login, true);
                targetUrl.query = targetUrl.query || {};
                targetUrl.query.next = this.$route.fullPath;
                return url.format(targetUrl);
            },
            adminUrl() {
                return routesMap.admin;
            }
        }
    }
</script>

<style scoped>

</style>