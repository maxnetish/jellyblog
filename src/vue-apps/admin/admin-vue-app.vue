<template src="./admin-vue-app.pug" lang="pug"></template>
<script>
    import Vue from 'vue';
    import {default as VuedalsPlugin, Component as VuedalComponent} from 'vuedals';
    import 'vue-strap/dist/vue-strap-lang.js';
    import routesMap from '../../../config/routes-map.json';

    Vue.use(VuedalsPlugin);

    export default {
        name: 'app',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App',
                logoutUrl: routesMap.logout
            }
        },
        components: {
            'vuedals': VuedalComponent
        }
    };
</script>
<style lang="less">
    @import (less) "../../../node_modules/bootstrap/dist/css/bootstrap.css";
    @import "../../less-common/overrides.less";
    @import "../../less-common/utils.less";

    body {
        font-family: 'Fira Sans', sans-serif;
    }

    .util-zindex-100 {
        z-index: 100;
    }

    .btn-near-multiselect {
        min-height: 40px;
    }

    .jb-form-ct {
        border: solid 2px lightskyblue;
        border-radius: 0.25em;
        padding: 0.5em 1em;
        margin: 0.5em 0;

        .form-group {
            margin-bottom: 0.25em;
            &:last-child {
                margin-bottom: 0;
            }
        }
    }
</style>
