import React from 'react';

import Button from 'elemental/lib/components/Button';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import Spinner from 'elemental/lib/components/Spinner';
import Glyph from 'elemental/lib/components/Glyph';
import Alert from 'elemental/lib/components/Alert';

import {setUserContext, authLogin} from '../../../passport/client';

class Login extends React.Component {
    constructor(props) {
        super(props);

        // set def state
        this.state = {};

        if (props.initialState) {
            Object.assign(this.state, props.initialState, {supressFetchOnMount: true})
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        console.info('Login did update, props: ', this.props);

        // If we should really fetch new data ?

    }

    render() {
        let formId = 'jellyblog-login-form',
            usernameId = 'jellyblog-login-username',
            passwordId = 'jellyblog-login-password';

        return <div>
            <Form id={formId} onSubmit={this.onFormSubmit.bind(this)} name={formId}>
                <FormField label="Login" htmlFor={usernameId}>
                    <FormInput autoFocus type="text" placeholder="Enter user name" name="username" required
                               id={usernameId} disabled={this.state.loading}/>
                </FormField>
                <FormField label="Password" htmlFor={passwordId}>
                    <FormInput type="password" placeholder="Password" name="password" id={passwordId}
                               disabled={this.state.loading}/>
                </FormField>
            </Form>
            {this.state.error ? <Alert type="danger"><strong>Error:</strong> {this.state.error.message}</Alert> : null}
            <Button type="primary" submit form={formId} disabled={this.state.loading}>
                {this.state.loading ? <Spinner type="inverted"/> : <Glyph icon="log-in"/>}
                &nbsp;Login
            </Button>
            <Button type="link-cancel" onClick={this.onCancel.bind(this)}
                    disabled={this.state.loading}>Cancel</Button>
        </div>;
    }

    onFormSubmit(e) {
        e.preventDefault();
        let form = e.target;
        let loginData = {
            username: form.username.value,
            password: form.password.value
        };
        authLogin(loginData)
            .then(res => {
                setUserContext(res);

                // redirect to / or to nextPathname
                let {location} = this.props;
                if (location.state && location.state.nextPathname) {
                    this.props.router.replace(location.state.nextPathname)
                } else {
                    this.props.router.replace('/')
                }
            })
            .catch(err => {
                this.setState({error: err})
            });
    }

    onCancel(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
    }

    static onRouteEnter({nextRouterState, replace, userContext}) {
        console.info(`${Login.componentId} onRouteEnter: `, {nextRouterState, userContext});
    }

    static get componentId() {
        return 'Login';
    }
}

export default Login;