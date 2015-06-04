var React = require('react/addons');
var Router = require('react-router');
var Link = Router.Link;

var GeneralSettingsForm = require('../../components/general-settings-form/general-settings-form.jsx');

var AdminHome = React.createClass({
    render: function () {
        return <section>
            <p>Admin home</p>
            {/*
            <pre>{JSON.stringify(this.props)}</pre>
            <pre>{JSON.stringify(this.state)}</pre>
             <Link to="admin-home" className="btn btn-default" activeClassName="disabled">Home</Link>
             <Link to="admin-other" className="btn btn-default" activeClassName="disabled">Other</Link>
            */}
            <GeneralSettingsForm />
        </section>;
    }
});

module.exports = AdminHome;