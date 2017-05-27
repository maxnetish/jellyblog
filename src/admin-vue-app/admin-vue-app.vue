<template src="./admin-vue-app.pug" lang="pug"></template>
<script src="./admin-vue-app.js"></script>
<style lang="less">
    body {
        font-family: 'Fira Sans', sans-serif;
    }

    .util-zindex-100 {
        z-index: 100;
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

        .form-after-buttons-row {
            margin: 0.5em 0 0 0;
        }
    }
</style>
