import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        },
        postFieldChanged: {
            async:false
        }
    }
});

class AdminPostStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {
        let self = this;
        resources.post.get({id: props.params.postId})
            .then(res => {
                self.assignState({
                    post: res
                });
                self.notifyStateChanged();
            })
            .catch(err=>{
                self.assignState({
                    err: err,
                    post: {}
                });
                self.notifyStateChanged();
            });
    }

    onPostFieldChanged(val){
        this.assignState({
            post: Object.assign(this.getState(), val)
        });
        this.notifyStateChanged();
    }
}

export {
    AdminPostStore,
    actions
};