var React = require('react/addons');
var Router = require('react-router');
var Link = Router.Link;

var AdminHome = React.createClass({
    render: function () {
        return <section>
            <p>Admin home</p>
            <Link to="admin-home" className="btn btn-default" activeClassName="disabled">Home</Link>
            <Link to="admin-other" className="btn btn-default" activeClassName="disabled">Other</Link>
        </section>;
    }
});

module.exports = AdminHome;