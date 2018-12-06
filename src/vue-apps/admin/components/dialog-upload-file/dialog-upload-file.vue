<template lang="pug">
    .upload-file-component-ct
        form(@submit.prevent="onSubmit", name="upload-file-form")
            input(ref="fileInput", type="file", style="display: none", @change="onFileInputChange")
            .row
                .col-sm-12
                    button.btn.btn-primary._margin-5._bottom(type="button", @click="onChooseFileButtonClick", :disabled="uploading")
                        i.fa.fa-fw.fa-files-o(aria-hidden="true")
                        span._margin-5._left {{'Choose file' | get-text}}
            .row
                .col-sm-12
                    .choosed-file-info.alert.alert-info(v-if="choosedFile")
                        .choosed-file-info__icon
                            i.fa.fa-fw(aria-hidden="true", :class="choosedFile.type | content-type-to-icon")
                        .choosed-file-info__descr.word-break-all
                            .choosed-file-info__filename {{choosedFile.name}}
                            .choosed-file-info__type {{choosedFile.type}}
                            .choosed-file-info__length {{choosedFile.size | number-to-locale-string}} {{'bytes' | get-text}}
                            .choosed-file-info__date
                                display-date(:value="choosedFile.lastModifiedDate")
            .row._margin-5._bottom
                .col-sm-12(v-if="choosedFile")
                    multiselect(
                    v-if="allowContextEdit",
                    v-model="contextInternal",
                    :options="availableContexts",
                    :multiple="false",
                    :taggable="false",
                    :close-on-select="true",
                    placeholder="Select one context",
                    :allowEmpty="false"
                    )
                    // input.form-control(type="text", v-if="allowContextEdit", :placeholder="'Context' | get-text", v-model.lazy="contextInternal")
                    span(v-else) {{contextInternal}}
            .row._margin-5._bottom
                .col-sm-12(v-if="choosedFile")
                    input.form-control(type="text", :placeholder="'Description' | get-text", v-model.lazy="description")
            .row
                .col-sm-12.text-right
                    .btn-group(role="group")
                        button.btn.btn-default(@click="onCancelButtonClick", type="button", :disabled="uploading")
                            i.fa.fa-ban.fa-fw(aria="hidden")
                            span._margin-5._left {{'Cancel' | get-text}}
                        button.btn.btn-primary(type="submit", :disabled="uploading || !choosedFile")
                            i.fa.fa-fw(aria-hidden="true", :class="{'fa-upload': !uploading, 'fa-spinner fa-spin': uploading}")
                            span._margin-5._left {{'OK' | get-text}}
</template>
<script>
    /**
     * props:
     *      context,
     *      postId,
     *      allowContextEdit
     */

    import uploadFile from '../../../../utils/upload-file';
    import DialogAlertMixin from '../dialog-alert/mixin';
    import routesMap from '../../../../../config/routes-map.json';
    import Multiselect from 'vue-multiselect';
    import fileStoreConfig from '../../../../../config/file-store.json';

    export default {
        name: 'add-image',
        mixins: [DialogAlertMixin],
        data() {
            return {
                uploading: false,
                choosedFile: null,
                description: '',
                contextInternal: this.context,
                availableContexts: fileStoreConfig.fields.map(c => c.name)
            }
        },
        props: {
            'context': {
                type: String,
                default: ''
            },
            'postId': {
                type: String,
                default: ''
            },
            'allowContextEdit': {
                type: Boolean,
                default: false
            }
        },
        methods: {
            onChooseFileButtonClick(e) {
                this.$refs.fileInput.click();
            },
            onFileInputChange(e) {
                this.choosedFile = this.$refs.fileInput.files[0];
            },
            onCancelButtonClick(e) {
                this.$emit('vuedals:close');
            },
            onSubmit(e) {
                let self = this;
                this.uploading = true;
                uploadFile({
                    file: this.choosedFile,
                    context: this.contextInternal,
                    metadata: {
                        postId: this.postId,
                        description: this.description
                    },
                    url: routesMap.upload
                })
                    .then(attachmentInfo => {
                        self.uploading = false;
                        self.$vuedals.close(attachmentInfo);
                    }, function (err) {
                        self.uploading = false;
                        self.showAlert({
                            message: `Upload failed: ${err}`
                        });
                    })
            }
        },
        components: {
            'multiselect': Multiselect
        }
    };
</script>
<style lang="less">
    .choosed-file-info {
        display: flex;
        & > * {
            margin-right: 10px;
        }
        & > *:last-child {
            margin-right: 0;
        }
        .choosed-file-info__descr {
            flex-grow: 1;
        }
    }
</style>