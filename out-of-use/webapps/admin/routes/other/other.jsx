var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var AdminOther = React.createClass({
    render: function () {
        return <section>
            <p>Admin other</p>
            {/*
            <pre>{JSON.stringify(this.props)}</pre>
            <pre>{JSON.stringify(this.state)}</pre>
            */}
            <Link to="admin-home" className="btn btn-default" activeClassName="disabled">Home</Link>
            <Link to="admin-other" className="btn btn-default" activeClassName="disabled">Other</Link>
        </section>;
    }
});

module.exports = AdminOther;