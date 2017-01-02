import React from 'react';

import classNames from 'classnames';
import {Link, withRouter} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';

import {authLogout, setUserContext} from '../../../passport/client';
import resources from '../../../resources';

const menuButtonSize = '';
const menuButtonType = 'link';

function getClassOfMenuItem({router, target, index, forceVisible}) {
    return classNames({
        'is-visible': forceVisible || router.isActive(target, index),
        'menu-item': true
    });
}

class AdminMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            forceVisible: false
        };
    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        let classOfHamburgerButton = classNames({
            'pressed': this.state.forceVisible,
            'menu-show-hide-btn': true
        });

        return <nav role="menu" className="admin-main-menu">
            <div className="menu-wrapper">
                <Button className={classOfHamburgerButton} type="default-primary"
                        onClick={this.onHamburgerClick.bind(this)}>
                    <Glyph icon="three-bars"/>
                </Button>

                <div className="menu-ct">

                    <div className={getClassOfMenuItem({
                        router: this.props.router,
                        target: '/admin',
                        forceVisible: this.state.forceVisible,
                        index: true
                    })}>
                        <Button type={menuButtonType}
                                onClick={this.onMenuButtonClick.bind(this)}
                                component={<Link to="/admin" activeClassName="active-link" onlyActiveOnIndex={true}>Admin
                                    home</Link>}/>
                    </div>
                    <div className={getClassOfMenuItem({
                        router: this.props.router,
                        target: '/admin/settings',
                        forceVisible: this.state.forceVisible
                    })}>
                        <Button type={menuButtonType}
                                onClick={this.onMenuButtonClick.bind(this)}
                                component={<Link to="/admin/settings" activeClassName="active-link">Settings</Link>}/>
                    </div>
                    <div className={getClassOfMenuItem({
                        router: this.props.router,
                        target: '/admin/posts',
                        forceVisible: this.state.forceVisible
                    })}>
                        <Button type={menuButtonType}
                                onClick={this.onMenuButtonClick.bind(this)}
                                component={<Link to="/admin/posts" activeClassName="active-link">Posts</Link>}/>
                    </div>
                    <div className={getClassOfMenuItem({
                        router: this.props.router,
                        target: '/admin/edit/',
                        forceVisible: this.state.forceVisible
                    })}>
                        <Button type={menuButtonType}
                                onClick={this.onMenuButtonNewPostClick.bind(this)}>New post</Button>
                    </div>
                </div>
            </div>
        </nav>
            ;
    }

    onHamburgerClick(e) {
        this.setState({
            forceVisible: !this.state.forceVisible
        });
    }

    onMenuButtonClick(e) {
        this.setState({
            forceVisible: false
        });
    }

    onMenuButtonNewPostClick(e) {
        let self = this;
        this.setState({
            forceVisible: false
        });

        resources.post.create()
            .then(res => {
                self.props.router.push(`/admin/edit/${res._id}`);
            });
    }

}

export default withRouter(AdminMenu);