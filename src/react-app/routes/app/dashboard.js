import React from 'react';

import * as resources from '../../../resources';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};

        if (props.initialState) {
            Object.assign(this.state, props.initialState, {supressFetchOnMount: true})
        }
    }

    componentDidMount() {
        console.info('Dashboard did mount, props: ', this.props);

        if (!this.state.supressFetchOnMount) {
            Dashboard.fetchInitialState({routeParams: this.props.params, routeQuery: this.props.location.query})
                .then(result => this.setState(result));
        }

        this.setState({supressFetchOnMount: false});
    }

    componentDidUpdate(prevProps, prevState) {
        console.info('Dasboard did update, props: ', this.props);

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

    static fetchInitialState({routeParams, routeQuery}) {
        return resources.fetchDashboardState({routeParams, routeQuery});
    }
}

export default Dashboard;