var React = require('react/addons');
var Router = require('react-router');
var Link = Router.Link;

var GeneralSettingsForm = require('../../components/general-settings-form/general-settings-form.jsx');

var AdminHome = React.createClass({
    render: function () {
        return <section>
            <GeneralSettingsForm />
        </section>;
    }
});

module.exports = AdminHome;