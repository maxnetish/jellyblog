import React from 'react';

import resources from '../../../resources';

import LinkBar from '../../components/linkbar';

class PubApp extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};

        if (props.initialState) {
            Object.assign(this.state, props.initialState, {supressFetchOnMount: true})
        }

        if(props.getUserContext) {
            this.state.user = props.getUserContext();
        }
    }

    componentDidMount() {
        // console.info('App did mount, props: ', this.props);

        if (!this.state.supressFetchOnMount) {
            PubApp.fetchInitialState({routeParams: this.props.params, routeQuery: this.props.location.query})
                .then(result => this.setState(result));
        }

        this.setState({supressFetchOnMount: false});
    }

    componentDidUpdate(prevProps, prevState) {
        // console.info('App did update, props: ', this.props);

        // If we should really fetch new data ?

        if(this.props.getUserContext) {
            let oldUser = prevState.user;
            let newUser = this.props.getUserContext();

            if(newUser.role!==oldUser.role || newUser.userName!==oldUser.userName){
                this.setState({
                    user: newUser
                });
            }
        }

    }

    render() {
        return <div>
            <LinkBar {...this.props}/>
            <h2>App component</h2>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>App state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
            {this.props.children}
        </div>;
    }

    static fetchInitialState({routeParams, routeQuery}) {
        return resources.initialStates.app({routeParams, routeQuery});
    }

    static onRouteEnter({nextRouterState, replace, userContext}) {
        // console.info(`${App.componentId} onRouteEnter: `, {nextRouterState, userContext});
    }

    static get componentId() {
        return 'PubApp';
    }
}

export default PubApp;