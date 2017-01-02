import React from 'react';

import {DashboardStore, actions} from './store';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};
        this.supressFetchOnMount = false;


        if (props.initialState) {
            Object.assign(this.state, props.initialState);
            this.supressFetchOnMount = true;
        }
        this.store = new DashboardStore(this.state);
    }

    componentDidMount() {
        // console.info('Dashboard did mount, props: ', this.props);

        this.store.on(DashboardStore.notificationEventKey, this.onStoreUpdate, this);

        if (!this.supressFetchOnMount) {
            actions.componentMounted(this.props);
        }
        this.supressFetchOnMount = false;
    }

    componentWillUnmount() {
        this.store.removeListener(DashboardStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    componentDidUpdate(prevProps, prevState) {
        // console.info('Dashboard did update, props: ', this.props);

        // If we should really fetch new data ?

    }

    render() {
        return <div>
            <h3>Dashboard component</h3>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>Dashboard state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
        </div>;
    }

    onStoreUpdate(updatedState) {
        // console.info('Store notificate: ', updatedState);
        this.setState(updatedState)
    }

    static fetchInitialState({routeParams, routeQuery}) {
        return DashboardStore.fetchInitialState({routeParams, routeQuery})
    }

    static onRouteEnter({nextRouterState, replace, userContext}) {
        // console.info(`${Dashboard.componentId} onRouteEnter: `, {nextRouterState, userContext});
    }

    static get componentId() {
        return 'Dashboard';
    }
}

export default Dashboard;