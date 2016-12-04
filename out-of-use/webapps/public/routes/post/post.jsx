var React = require('react');
var Router = require('react-router');
var _ = require('lodash');

var PublicPost = React.createClass({
    render: function render() {
        return (
            <div>
                <h2>Public Post</h2>
                <Router.Link to="public-home">
                    Home
                </Router.Link>
                <label>Props of Post:</label>
                <pre>{JSON.stringify(this.props.params, null, '\t')}</pre>
                <pre>{JSON.stringify(this.props.query, null, '\t')}</pre>
            </div>
        );
    }
});

module.exports = PublicPost;