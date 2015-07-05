var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');

var ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup');
var componentFlux = require('./admin-posts-list-flux');

var PostEdit = require('../admin-post-edit/admin-post-edit.jsx');

function renderPostInfo(postInfo, active, handleActive) {
    var itemClass = ClassSet({
        'list-group-item': true,
        'list-group-item-success': !postInfo.draft,
        'list-group-item-info': postInfo.draft,
        'active': !!active
    });

    return <a className={itemClass} key={postInfo._id} href="javascript:void 0;"
              onClick={handleActive.bind(null, postInfo._id)}>
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

function renderPager(previousSkip, nextSkip, loading) {
    var previousClass = ClassSet({
        'previous': true,
        'disabled': _.isNull(previousSkip) || loading
    });
    var nextClass = ClassSet({
        'next': true,
        'disabled': _.isNull(nextSkip) || loading
    });

    return <nav>
        <ul className="pager">
            <li className={previousClass}>
                {(_.isNull(previousSkip) || loading) ?
                    <a href="javascript:void 0">
                        <i className="glyphicon glyphicon-circle-arrow-left"></i>
                    </a> :
                    <Router.Link to="admin-posts" query={{skip: previousSkip}} title="Previous page">
                        <i className="glyphicon glyphicon-circle-arrow-left"></i>
                    </Router.Link>
                }
            </li>
            <li className={nextClass}>
                {(_.isNull(nextSkip) || loading) ?
                    <a href="javascript:void 0">
                        Next&nbsp;
                        <i className="glyphicon glyphicon-circle-arrow-right"></i>
                    </a> :
                    <Router.Link to="admin-posts" query={{skip: nextSkip}} title="Next page">
                        Next&nbsp;
                        <i className="glyphicon glyphicon-circle-arrow-right"></i>
                    </Router.Link>
                }
            </li>
        </ul>
    </nav>;
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
                    {renderPager(this.state.previousSkip, this.state.nextSkip, this.state.loading)}
                    <div className="panel panel-default">
                        <ReactCSSTransitionGroup component="div"
                                                 className="list-group hidden-x"
                                                 transitionName="admin-posts-list"
                                                 transitionAppear={true}>
                            {_.map(this.state.posts, function (postInfo) {
                                return renderPostInfo(postInfo, (postInfo._id === this.state.activePostId), this.handleActivePost);
                            }, this)}
                        </ReactCSSTransitionGroup>
                    </div>
                </div>
                <div className="col-sm-8 col-xs-7">
                    <PostEdit postId={this.state.activePostId}/>
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