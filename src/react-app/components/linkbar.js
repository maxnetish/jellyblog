import React from 'react';

import {Link} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';

import userContext from '../../passport/client';
import globalDispatcher from '../../state-utils/global-dispatcher';
import resources from '../../resources';

class LinkBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        if (props.getUserContext) {
            this.state.user = props.getUserContext();
        }
    }

    componentDidMount() {
        globalDispatcher.on(globalDispatcher.eventKeys.USER_CHANGED, this.onUserChanged, this);
    }

    componentWillUnmount() {
        globalDispatcher.removeListener(globalDispatcher.eventKeys.USER_CHANGED, this.onUserChanged, this);
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
                    <Link to="/admin" activeClassName="active-link">Admin area</Link>
                </li>
            </ul>
        </nav>;
    }

    handleLogout(e) {
        let self = this;

        resources.auth.logout()
            .then(res => {
                userContext.setContext(res);
                globalDispatcher.emit(globalDispatcher.eventKeys.USER_CHANGED, userContext);
            })
            .catch(err => console.warn(err));
    }

    onUserChanged(e) {
        this.setState({
            user: e
        });
    }
}

export default LinkBar;