var React = require('react/addons');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');

var componentFlux = require('./admin-posts-list-flux');

var PostEdit = require('../admin-post-edit/admin-post-edit.jsx');

function renderPostInfo(postInfo, active, handleActive) {
    var itemClass = ClassSet({
        'list-group-item': true,
        'list-group-item-success': !postInfo.draft,
        'list-group-item-info': postInfo.draft,
        'active': !!active
    });

    return <a className={itemClass} key={postInfo._id} href="javascript:void 0;" onClick={handleActive.bind(null, postInfo._id)}>
        <div className="row">
            <div className="col-lg-6 col-md-12">
                <span>{postInfo.title}</span>
            </div>
            <div className="col-lg-6 col-md-12">
                <time className="small" dateTime={postInfo.date}>{moment(postInfo.date).format('LLL')}</time>
            </div>
        </div>
    </a>;
}

var AdminPostsList = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <section className="admin-posts-list">
            <div className="row">
                <div className="col-sm-4 col-xs-5">
                    <nav className="">
                        <ul className="pager">
                            <li className="previous">
                                <a href="#" title="Previous page">
                                    <i className="glyphicon glyphicon-circle-arrow-left"></i>
                                </a>
                            </li>
                            <li className="next">
                                <Router.Link to="admin-posts" query={{skip: 10}} title="Next page">
                                    Next&nbsp;
                                    <i className="glyphicon glyphicon-circle-arrow-right"></i>
                                </Router.Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="panel panel-default">
                        <div className="list-group">
                            {_.map(this.state.posts, function (postInfo) {
                                return renderPostInfo(postInfo, (postInfo._id === this.state.activePostId), this.handleActivePost);
                            }, this)}
                        </div>
                    </div>
                </div>
                <div className="col-sm-8 col-xs-7">
                    <PostEdit postId={this.state.activePostId} />
                </div>
            </div>
            <pre>{JSON.stringify(this.props.query, null, '\t')}</pre>
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted(this.props.query);
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    componentWillReceiveProps: function (nextProps) {
        componentFlux.actions.queryChanged(nextProps.query);
    },

    handleActivePost: function (postId) {
        componentFlux.actions.postSelected(postId);
    },

    onStoreChanged: function (newViewModel) {
        this.setState(newViewModel);
    }
});

module.exports = AdminPostsList;