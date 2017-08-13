import DialogConfirm from './dialog-confirm.vue';

export default {
    methods: {
        showConfirm({message = 'Confirm action?', title = 'Confirm'} = {}) {
            return new Promise((resolve, reject) => {
                this.$vuedals.open({
                    title: title,
                    props: {
                        message: message
                    },
                    component: DialogConfirm,
                    size: 'xs',
                    dismisable: true,
                    onClose: answer => {
                        switch (answer) {
                            case 'YES':
                                resolve('YES');
                                break;
                            default:
                                reject('NO');
                                break;
                        }
                    },
                    onDismiss: () => {
                        reject('NO');
                    }
                });
            });
        }
    }
};