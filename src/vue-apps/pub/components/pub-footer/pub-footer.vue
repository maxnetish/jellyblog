<template lang="pug" src="./pub-footer.pug"></template>

<script>
    import routesMap from '../../../../../config/routes-map.json';
    import url from 'url';
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
    import {faSignoutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
    import {faCogs} from '@fortawesome/free-solid-svg-icons/faCogs';
    import {faSigninAlt} from'@fortawesome/free-solid-svg-icons/faSignInAlt';

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
            },
            iconLogout(){
                return faSignoutAlt;
            },
            iconCogs(){
                return faCogs;
            },
            iconLogin(){
                return faSigninAlt;
            }
        },
        components: {
            FontAwesomeIcon
        }
    }
</script>

<style scoped>

</style>
