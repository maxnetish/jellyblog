var React = require('react/addons');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');
var momentRu = require('moment/locale/ru');

var componentFlux = require('./admin-posts-list-flux');

function renderPostInfo(postInfo) {
    var itemClass=ClassSet({
       'list-group-item': true,
        'list-group-item-success': !postInfo.draft,
        'list-group-item-info': postInfo.draft
    });

    return <li className={itemClass} key={postInfo._id}>
        <div className="row">
            <div className="col-md-4">
                <span>{postInfo.title}</span>
            </div>
            <div className="col-md-4">
                <time className="small" dateTime={postInfo.date}>{postInfo.dateFormatted}</time>
            </div>
            <div className="col-md-4">
                {moment(postInfo.date).locale('ru').format('LLL')}
            </div>
        </div>
    </li>;
}

var AdminPostsList = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <section className="admin-posts-list">
            <div className="panel panel-default">
                <ul className="list-group">
                    {_.map(this.state.posts, renderPostInfo)}
                </ul>
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

    onStoreChanged: function (newViewModel) {
        this.setState(newViewModel);
    }
});

module.exports = AdminPostsList;