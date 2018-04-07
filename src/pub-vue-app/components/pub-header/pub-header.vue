<template lang="pug" src="./pub-header.pug"></template>
<script src="./pub-header.js"></script>
<style scoped lang="less">
    .index-link {
        text-decoration: none;
        color: inherit;
        &:hover, &:active {
            color: inherit;
            background-color: inherit;
        }
        &.index-link-active {
            cursor: text;
            &:focus {
                outline: none;
            }
        }
    }
</style>