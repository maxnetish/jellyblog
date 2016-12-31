import React from 'react';

import {Link} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';

import {authLogout, setUserContext} from '../../../passport/client';

class AdminMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        return <nav role="menu" className="admin-main-menu">
            <div className="menu-ct">
                <div className="menu-item">
                    <Link to="/admin" activeClassName="active-link" onlyActiveOnIndex={true}>Admin home</Link>
                </div>
                <div className="menu-item">
                    <Link to="/admin/settings" activeClassName="active-link">Settings</Link>
                </div>
            </div>
        </nav>;
    }

}

export default AdminMenu;