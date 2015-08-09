var React = require('react');
var Router = require('react-router');
// var _ = require('lodash');


var PublicHome = React.createClass({
    render: function render() {
        return (
            <div>


                <h2>Public Home</h2>
                <Router.Link to="public-post" params={{postId: 'whatever'}}>
                    Post
                </Router.Link>
                <Router.Link to="public-tag" params={{tagId: 'whatever-tag'}}>
                    Tag
                </Router.Link>
                <label>Props of Home:</label>
                <pre>{JSON.stringify(this.props.params, null, '\t')}</pre>
                <pre>{JSON.stringify(this.props.query, null, '\t')}</pre>
            </div>
        );
    }
});

module.exports = PublicHome;
