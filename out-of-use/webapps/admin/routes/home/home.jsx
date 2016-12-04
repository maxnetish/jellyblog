var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var AdminViewWrapper = require('../../components/admin-view-wrapper/admin-view-wrapper.jsx');
var GeneralSettingsForm = require('../../components/general-settings-form/general-settings-form.jsx');

var AdminHome = React.createClass({
    render: function () {
        return <section>
            <GeneralSettingsForm />
        </section>;
    }
});

module.exports = AdminHome;