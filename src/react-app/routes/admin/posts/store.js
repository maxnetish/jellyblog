import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

import {debounce, autobind} from 'core-decorators';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        },
        'queryFilterTextChanged': {
            async: true
        },
        needQuery: {
            async: true
        },
        'queryResponseReceived': {
            async: false
        }
    }
});

class AdminPostsStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
        console.info('Instantiate Admin Store');
    }

    onComponentMounted(props) {
        // actions.needQuery({
        //     q: props.location.query.q
        // });
    }

    onQueryFilterTextChanged(q) {
        this.assignState({
            q: q
        });
        this.notifyStateChanged();
        this.afterQueryChanged(q);
    }

    @autobind
    @debounce(500)
    afterQueryChanged(q) {
        let currentQueryFilter = this.getState().queryFilter || '';
        q = q || '';
        if (currentQueryFilter === q) {
            return;
        }
        if (q.length === 0) {
            this.assignState({
                queryFilter: undefined,
            });
            this.notifyStateChanged();
        }
        if (q.length > 2) {
            this.assignState({
                queryFilter: q
            });
            this.notifyStateChanged();
        }
    }

    @autobind
    onNeedQuery(query) {
        query = Object.assign({}, query, {
            statuses: ['DRAFT', 'PUB']
        });
        this.assignState({
            searching: true
        });
        this.notifyStateChanged();
        resources.post.list(query)
            .then(actions.queryResponseReceived);
    }

    @autobind
    onQueryResponseReceived(response) {
        this.assignState({
            posts: response.items,
            hasMore: response.hasMore,
            searching: false
        });
        this.notifyStateChanged();
    }

}

export {
    AdminPostsStore,
    actions
};