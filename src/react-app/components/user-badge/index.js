import React from 'react';
import {withRouter} from 'react-router';

import resources from '../../../resources';

import Button from 'elemental/lib/components/Button';
import Card from 'elemental/lib/components/Card';
import Glyph from 'elemental/lib/components/Glyph';

import LoginDialog from '../login-dialog';

class UserBadge extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userContext: props.user
        };
    }

    render() {
        let user = this.state.userContext;
        let internalMarkup;
        if (user && user.userName) {
            internalMarkup = <Card>
                <div className="">
                    <span>Logged in as <b>{user.userName}</b> ({user.role})</span>
                    <Button type="link-cancel" onClick={this.handleLogout.bind(this)}>
                        <Glyph icon="log-out"/>
                        &nbsp;Logout
                    </Button>
                </div>
            </Card>;
        } else {
            internalMarkup = <Card>
                <div className="">
                    <Button type="link-primary" onClick={this.handleLogin.bind(this)}>
                        <Glyph icon="log-in"/>
                        &nbsp;Login
                    </Button>
                </div>
                <LoginDialog isOpen={this.state.loginDialogVisible}
                             onCancel={this.handleLoginDialogCancel.bind(this)}
                             onFullfill={this.handleLoginDialogFulfilled.bind(this)}
                             user={user}/>
            </Card>;
        }

        return <div className="">
            {internalMarkup}
        </div>;
    }

    componentDidMount() {
        // on front only, so begin listen to UserContext here

    }

    componentDidUpdate(prevProps, prevState) {
        // console.info('UserBadge did update, props: ', this.props);

        // If we should really fetch new data ?

    }

    handleLogin() {
        this.setState({
            loginDialogVisible: true
        });
    }

    handleLoginDialogCancel() {
        this.setState({
            loginDialogVisible: false
        });
    }

    handleLoginDialogFulfilled() {
        this.setState({
            loginDialogVisible: false
        });
    }

    handleLogout() {
        let self = this;
        resources.auth.logout()
            .then(response => {
                self.props.user.setContext(response || {});
                self.forceUpdate();
                self.props.router.push('/');
            })
            .catch(err => {
                console.warn(err);
            })
    }
}

UserBadge.propTypes = {
    user: React.PropTypes.object.isRequired
};

export default withRouter(UserBadge);