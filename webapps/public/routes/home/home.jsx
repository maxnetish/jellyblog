var React = require('react');
var Router = require('react-router');
var _ = require('lodash');

var PublicHome = React.createClass({
    render: function render() {
        return (
            <div>
                <h2>Public Home</h2>
                <Router.Link to="public-other">
                    Other
                </Router.Link>
                <label>Props of Home:</label>
                <pre>{JSON.stringify(_.omit(this.props, ['children']), null, '\t')}</pre>
            </div>
        );
    }
});

module.exports = PublicHome;