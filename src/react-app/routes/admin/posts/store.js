import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        }
    }
});

class AdminPostsStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
        console.info('Instantiate Admin Store');
    }

    onComponentMounted(props) {
        console.info('onComponentMounted Admin Store');
        resources.post.list()
            .then(response => {
                this.assignState({
                    posts: response.items,
                    hasMore: response.hasMore
                });
                this.notifyStateChanged();
            })
    }
}

export {
    AdminPostsStore,
    actions
};