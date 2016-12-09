import React from 'react';

import * as resources from '../../../resources';

import LinkBar from '../../components/linkbar';

class App extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};

        if (props.initialState) {
            Object.assign(this.state, props.initialState, {supressFetchOnMount: true})
        }
    }

    componentDidMount() {
        console.info('App did mount, props: ', this.props);

        if (!this.state.supressFetchOnMount) {
            App.fetchInitialState({routeParams: this.props.params, routeQuery: this.props.location.query})
                .then(result => this.setState(result));
        }

        this.setState({supressFetchOnMount: false});
    }

    componentDidUpdate(prevProps, prevState) {
        console.info('App did update, props: ', this.props);

        // If we should really fetch new data ?

    }

    render() {
        return <div>
            <LinkBar/>
            <h2>App component</h2>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>App state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
            {this.props.children}
        </div>;
    }

    static fetchInitialState({routeParams, routeQuery}) {
        return resources.fetchAppState({routeParams, routeQuery});
    }
}

export default App;