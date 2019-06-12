<template lang="pug" src="./pub-vue-app.pug"></template>

<script src="./pub-vue-app.js"></script>

<style lang="less">
    @import "../../../node_modules/bootstrap/less/normalize.less";
    @import "../../less-common/overrides.less";
    @import "../../less-common/utils.less";
    @import "../../less-pub/footer.less";
    @import "../../less-pub/header.less";
    @import "../../less-pub/layout.less";
    @import "../../less-pub/overrides.less";
    @import "../../less-pub/pagination.less";
    @import "../../less-pub/post.less";
    @import "../../less-pub/sidebar.less";
    @import "../../less-pub/utils.less";
    @import (less) "../../../node_modules/@fortawesome/fontawesome-svg-core/styles.css";

    .route-enter-active,
    .route-leave-active {
        transition: opacity .25s;
    }

    .route-enter,
    .route-leave-to {
        opacity: 0;
    }
</style>
