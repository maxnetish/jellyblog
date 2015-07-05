var React = require('react');
var Router = require('react-router');

var PostsFilter = require('../../components/posts-filter/posts-filter.jsx');
var PostsList = require('../../components/admin-posts-list/admin-posts-list.jsx');

var AdminPosts = React.createClass({
    render: function () {
        return <section>
            <PostsFilter {...this.props}/>
            <PostsList {...this.props}/>
        </section>;
    }
});

module.exports = AdminPosts;