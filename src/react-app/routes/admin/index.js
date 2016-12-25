import React from 'react';

import AdminMenu from '../../components/admin-menu';

class AdminApp extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};

        if(props.getUserContext) {
            this.state.user = props.getUserContext();
        }
    }

    componentDidMount() {
        console.info('Admin-app did mount, props: ', this.props);
    }

    componentDidUpdate(prevProps, prevState) {
        console.info('Admin-app did update, props: ', this.props);

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
            <AdminMenu {...this.props}/>
            <h2>Admin-app component</h2>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>App state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
            {this.props.children}
        </div>;
    }

    // static fetchInitialState({routeParams, routeQuery}) {
    //     return resources.initialStates.app({routeParams, routeQuery});
    // }

    static get componentId() {
        return 'AdminApp';
    }

    static get requireRoles() {
        return ['admin'];
    }
}

export default AdminApp;