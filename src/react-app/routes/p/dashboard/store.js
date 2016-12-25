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

class DashboardStore extends StateStoreBase {
    constructor(initialState) {
        super({initialState, actions});
    }

    onComponentMounted(props) {
        this.assignState({
            loading: true
        });
        this.notifyStateChanged();

        DashboardStore.fetchInitialState({routeParams: props.params, routeQuery: props.location.query})
            .then(res => {
                this.assignState(res);
                this.assignState({error: null});
                this.assignState({loading: false});
                this.notifyStateChanged();
            })
            .catch(err => {
                this.assignState({
                    error: err
                });
                this.assignState({loading: false});
                this.notifyStateChanged();
            });
    }

    static fetchInitialState({routeParams, routeQuery}) {
        return resources.initialStates.dashboard({routeParams, routeQuery});
    }
}

export {
    DashboardStore,
    actions
};