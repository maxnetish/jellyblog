var React = require('react');
var Navmenu = require('../navmenu/navmenu.jsx');
var AuthRedirector = require('../auth-redirector/auth-redirector.jsx');
var AdminViewWrapper = require('../admin-view-wrapper/admin-view-wrapper.jsx');
var CommonDialogsComponent = require('../../../common/components/common-dialogs/common-dialogs.jsx');

var App = React.createClass({
    render: function () {
        var injectedFromBackend = (window && window.jb__injected) || {};
        var isAdmin = !!(injectedFromBackend && injectedFromBackend.admin);

        return <div>
            <Navmenu />
            {isAdmin ?
                <AdminViewWrapper>{this.props.children}</AdminViewWrapper> :
                <AuthRedirector />
            }
            <CommonDialogsComponent />
        </div>;
    }
});

module.exports = App;
