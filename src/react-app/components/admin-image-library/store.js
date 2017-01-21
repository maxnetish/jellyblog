import StateStoreBase from '../../../state-utils/state-store-base';
import Actions from '../../../state-utils/actions';
import resources from '../../../resources';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        }
    }
});

class ImageLibraryStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {
        console.info('onComponentMounted Admin Store');
        // resources.post.list()
        //     .then(response => {
        //         this.assignState({
        //             posts: response.items,
        //             hasMore: response.hasMore
        //         });
        //         this.notifyStateChanged();
        //     })
    }
}

export {
    ImageLibraryStore,
    actions
};