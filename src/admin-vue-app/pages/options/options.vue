<template lang="pug">
    .panel.panel-warning
        .panel-heading {{'Maintenance' | get-text}}
        .panel-body
            .row
                .col-xs-12
                    a.btn.btn-warning(type="button", :href="downloadDumpUrl")
                        i.fa.fa-download.fa-fw(aria="hidden")
                        span._margin-5._left {{'Download database dump' | get-text}}
            .row._margin-5._top
                .col-xs-4
                    button.btn.btn-warning(type="button", @click="restoreDbuploadClick", :disabled="uploading")
                        i.fa.fa-fw.fa-upload(aria-hidden="true", v-if="!uploading")
                        i.fa.fa-wf.fa-cog.fa-spin(aria-hidden="true", v-if="uploading")
                        span._margin-5._left {{'Restore database from dump' | get-text}}
                    input(type="file", style="display:none", ref="restoreDbuploadFileInput", @change="restoreDbuploadFileInputChanged")
            .row._margin-5._top(v-for="result in restoreResults")
                .col-xs-12
                    pre code: {{result.code}}; signal: {{result.signal}}
                        .alert.alert-success(v-if="result.stdout")
                            pre(v-html="result.stdout")
                        .alert.alert-danger(v-if="result.stderr")
                            pre(v-html="result.stderr")

</template>
<script>
    import routesMap from '../../../../config/routes-map.json';
    import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
    import DialogAlertMixin from '../../components/dialog-alert/mixin';
    import {getText} from '../../filters';
    import uploadFile from '../../../utils/upload-file';

    export default {
        name: 'options',
        mixins: [DialogConfirmMixin, DialogAlertMixin],
        data() {
            return {
                uploading: false,
                restoreResults: []
            }
        },
        computed: {
            downloadDumpUrl() {
                return routesMap.dbDump;
            }
        },
        methods: {
            restoreDbuploadClick(e) {
                this.$refs.restoreDbuploadFileInput.click();
            },
            restoreDbuploadFileInputChanged(e) {
                let f = e.target.files[0];
                let self = this;

                this.showConfirm({
                    message: getText('Restore database from dump file?'),
                    title: getText('Restore')
                })
                    .then(() => {
                        self.uploading = true;
                        uploadFile({
                            file: f,
                            context: 'dump',
                            metadata: {},
                            url: routesMap.dbRestore
                        })
                            .then(restoreResponse => {
                                self.uploading = false;
                                // console.info(restoreResponse);
                                self.restoreResults.unshift(restoreResponse);
                            }, function (err) {
                                self.uploading = false;
                                console.warn(err);
                            })
                    })
                    .then(null, err => {
                        if (err === 'NO') {
                            return;
                        }
                        this.showAlert(err);
                    });
            }
        }
    }
</script>
<style lang="less">

</style>