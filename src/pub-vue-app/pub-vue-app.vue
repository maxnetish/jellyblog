<template lang="pug" src="./pub-vue-app.pug"></template>

<script src="./pub-vue-app.js"></script>

<style lang="less" scoped>
    .route-enter-active,
    .route-leave-active {
        transition: opacity .25s;
    }

    .route-enter,
    .route-leave-to {
        opacity: 0;
    }
</style>