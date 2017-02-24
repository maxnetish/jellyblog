import React from 'react';
import {withRouter} from 'react-router';

import resources from '../../../resources';

import Modal from 'elemental/lib/components/Modal';
import ModalBody from 'elemental/lib/components/ModalBody';
import ModalHeader from 'elemental/lib/components/ModalHeader';
import ModalFooter from 'elemental/lib/components/ModalFooter';
import Button from 'elemental/lib/components/Button';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import Spinner from 'elemental/lib/components/Spinner';
import Glyph from 'elemental/lib/components/Glyph';
import Alert from 'elemental/lib/components/Alert';

class LoginDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen && !nextProps.isOpen) {
            this.setState({
                error: null
            });
        }
    }

    render() {
        let formId = 'jellyblog-login-form',
            usernameId = 'jellyblog-login-form-input-username',
            passwordId = 'jellyblog-login-form-input-password';

        return <Modal width="small" isOpen={this.props.isOpen} onCancel={this.onCancel.bind(this)}>
            <ModalHeader text="Login" showCloseButton onClose={this.onCancel.bind(this)}/>
            <ModalBody>
                <Form id={formId} onSubmit={this.onFormSubmit.bind(this)} name={formId} method="POST">
                    <FormField label="Login" htmlFor={usernameId}>
                        <FormInput autoFocus type="text" placeholder="Enter user name" name="username" required
                                   id={usernameId} disabled={this.state.loading}/>
                    </FormField>
                    <FormField label="Password" htmlFor={passwordId}>
                        <FormInput type="password" placeholder="Password" name="password" id={passwordId}
                                   disabled={this.state.loading}/>
                    </FormField>
                </Form>
                {this.state.error ?
                    <Alert type="danger"><strong>Error:</strong> {this.state.error.message}</Alert> : null}
            </ModalBody>
            <ModalFooter>
                {/* FIXME: https://wpdev.uservoice.com/forums/257854-microsoft-edge-developer/suggestions/7327649-add-support-for-the-form-attribute form attr didn't work in IE*/}
                <Button type="primary" submit form={formId} disabled={this.state.loading} value="login">
                    {this.state.loading ? <Spinner type="inverted"/> : <Glyph icon="log-in"/>}
                    &nbsp;Login
                </Button>
                <Button type="link-cancel" onClick={this.onCancel.bind(this)}
                        disabled={this.state.loading}>Cancel</Button>
            </ModalFooter>
        </Modal>;
    }

    onCancel(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        this.props.onCancel();
    }

    onFormSubmit(e) {
        e.preventDefault();
        let form = e.target;
        let self = this;

        resources.auth.login({
            username: form.username.value,
            password: form.password.value
        })
            .then(response => {
                self.props.onFullfill();
                setTimeout(() => {
                    self.props.user.setContext(response);
                    if (self.props.location && self.props.location.query && self.props.location.query.next) {
                        self.props.router.replace(self.props.location.query.next);
                    }
                }, 100);
            })
            .catch(err => {
                self.setState({
                    error: err
                });
            });
    }

}

LoginDialog.propTypes = {
    isOpen: React.PropTypes.bool,
    onCancel: React.PropTypes.func.isRequired,
    onFullfill: React.PropTypes.func.isRequired,
    user: React.PropTypes.object
};

export default withRouter(LoginDialog);