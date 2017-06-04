<template src="./post.pug" lang="pug"></template>
<script src="./post.js"></script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="less">
    .jb-ace-editor-brief {
        height: 5em;
    }

    .jb-ace-editor-content {
        height: 25em;
    }

    .jb-content-preview {
        height: 25em;
        overflow-y: auto;
    }

    .option__avatar-ct {
        display: flex;
        .option__avatar-image {
            height: 50px;
            margin: 0 10px 0 0;
        }
        .option__avatar-desc {
            .option__avatar-title {
                word-wrap: break-word;
                word-break: keep-all;
                white-space: normal;
            }
        }
    }
    .btn-in-select {
        margin-left: 60px;
    }
    .multiselect-avatar {
        .multiselect__content {
            overflow-y: auto;
            overflow-x: hidden;
        }
        .multiselect__single {
            word-wrap: break-word;
            word-break: keep-all;
        }
    }
    .selected-avatar-ct {
        margin: 10px 0 5px 0;
        display: flex;
        .selected-avatar {
            height: 100px;
            margin: 0 10px 0 0;
        }
    }
</style>