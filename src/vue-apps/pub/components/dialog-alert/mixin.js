export default {
    methods: {
        showAlert({message = 'Something wrong', title = 'Error'} = {}) {
            return new Promise((resolve, reject) => {
                this.$vuedals.open({
                    title: title,
                    props: {
                        message: message
                    },
                    component: {
                        name: 'alert-vuedals',
                        props: ['message'],
                        template: '<div class="">{{message}}</div>'
                    },
                    size: 'xs',
                    dismissable: true,
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