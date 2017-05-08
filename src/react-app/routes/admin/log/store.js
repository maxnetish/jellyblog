import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

import {debounce, autobind} from 'core-decorators';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
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

class LogStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {

    }

    @autobind
    onNeedQuery(query) {
        this.assignState({
            searching: true
        });
        this.notifyStateChanged();
        resources.log.get(query)
            .then(actions.queryResponseReceived);
    }

    @autobind
    onQueryResponseReceived(response) {
        this.assignState({
            logEntries: response.items,
            hasMore: response.hasMore,
            searching: false
        });
        this.notifyStateChanged();
    }

}

export {
    LogStore,
    actions
};