import DialogUpload from './dialog-upload-file.vue';

export default {
    methods: {
        showUploadFileDialog({context = '', postId = '', allowContextEdit = false, title = 'Upload file'} = {}) {
            return new Promise((resolve, reject) => {
                this.$vuedals.open({
                    title: title,
                    props: {
                        context: context,
                        postId: postId,
                        allowContextEdit: allowContextEdit
                    },
                    component: DialogUpload,
                    size: 'xs',
                    dismissable: true,
                    onClose: attachmentInfo => {
                        if(attachmentInfo) {
                            resolve(attachmentInfo);
                            return;
                        }
                        reject('cancel');
                    },
                    onDismiss: reason => {
                        reject(reason || 'cancel');
                    }
                });
            });
        }
    }
};