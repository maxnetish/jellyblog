import DialogAlert from './dialog-alert.vue';

export default {
    methods: {
        showAlert({message = 'Something wrong', title = 'Error'} = {}) {
            return new Promise((resolve, reject) => {
                this.$vuedals.open({
                    title: title,
                    props: {
                        message: message
                    },
                    component: DialogAlert,
                    size: 'xs',
                    dismisable: true,
                    onClose: () => {
                        resolve('close');
                    },
                    onDismiss: () => {
                        resolve('dismiss');
                    }
                });
            });
        }
    }
};