var React = require('react');
var Router = require('react-router');

var Public404 = React.createClass({
    render: function render() {
        return (
            <section>
                <h2>Error 404</h2>
                <div className="alert alert-warning" role="alert">
                    No such page. Try to start from the <Router.Link className="alert-link" to="public-home">beginning</Router.Link>
                </div>
            </section>
        );
    }
});

module.exports = Public404;