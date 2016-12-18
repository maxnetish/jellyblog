import React from 'react';

import {Link} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';

import {authLogout, setUserContext} from '../../passport/client';

class LinkBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        if (props.getUserContext) {
            this.state.user = props.getUserContext();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.getUserContext) {
            let oldUser = prevState.user;
            let newUser = this.props.getUserContext();

            if (newUser.role !== oldUser.role || newUser.userName !== oldUser.userName) {
                this.setState({
                    user: newUser
                });
            }
        }
    }

    render() {
        return <nav role="menu">
            <ul>
                <li>
                    <Link to="/p" activeClassName="active-link" onlyActiveOnIndex={true}>Root</Link>
                </li>
                <li>
                    <Link to="/p/about" activeClassName="active-link">About</Link>
                </li>
                <li>
                    <Link to="/p/posts" activeClassName="active-link">Posts</Link>
                </li>
                <li>
                    <Link to="/p/post/123" activeClassName="active-link">Posts -> 123</Link>
                </li>
                <li>
                    <Link to="/p/non-existent/path" activeClassName="active-link">No path</Link>
                </li>
                <li>
                    {
                        (this.state.user && this.state.user.userName) ?
                            <Button type="link-cancel" onClick={this.handleLogout.bind(this)}>
                                <Glyph icon="log-out"/>
                                &nbsp;Logout
                            </Button> :
                            <Link to="/login" activeClassName="active-link">Login</Link>
                    }
                </li>
            </ul>
        </nav>;
    }

    handleLogout(e) {
        authLogout()
            .then(res => {
                setUserContext(res);
                // redirect to /
                this.props.router.replace(this.props.router.location);
            })
            .catch(err => console.warn(err));
    }
}

export default LinkBar;