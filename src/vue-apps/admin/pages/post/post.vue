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
        & > * {
            margin-right: 10px;
        }
        & > *:last-child {
            margin-right: 0;
        }
        .option__avatar-image {
            height: 50px;
        }
        .option__avatar-desc {
            .option__avatar-title {

            }
        }
        .option__avatar-buttons {
            visibility: hidden;
        }
        &:hover .option__avatar-buttons {
            visibility: visible;
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
            word-break: break-word;
            white-space: normal;
        }
    }
    .selected-avatar-ct {
        margin: 10px 0 5px 0;
        display: flex;
        & > * {
            margin-right: 10px;
        }
        & > *:last-child {
            margin-right: 0;
        }
        .selected-avatar {
            height: 100px;
        }
        .selected-avatar-desc {
        }
    }
    .post-form-attachment-ct {
        display: flex;
        & > * {
            margin-right: 10px;
        }
        & > *:last-child {
            margin-right: 0;
        }
    }
</style>