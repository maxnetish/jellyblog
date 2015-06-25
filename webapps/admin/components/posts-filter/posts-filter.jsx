var React = require('react/addons');
var Router = require('react-router');
var ClassSet = require('classnames');
var _ = require('lodash');

var PostsFilter = React.createClass({
    mixins: [Router.Navigation],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return _.cloneDeep(this.props.query);
    },
    render: function () {
        return <section className="posts-filter">
            <div className="panel panel-default">
                <div className="panel-body">
                    <form name="general-settings-form"
                          id="filter-form"
                          ref="filterForm"
                          onSubmit={this.handleSubmitForm}>
                        <div className="form-horizontal">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="filter-title" className="col-md-2 control-label">Post
                                            title</label>

                                        <div className="col-md-10">
                                            <input name="title"
                                                   type="text"
                                                   id="filter-title"
                                                   className="form-control"
                                                   placeholder=""
                                                   maxLength="64"
                                                   value={this.state.title}
                                                   onChange={this.handleFieldChange}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="filter-content"
                                               className="col-md-2 control-label">Content</label>

                                        <div className="col-md-10">
                                            <input name="content"
                                                   type="text"
                                                   id="filter-content"
                                                   className="form-control"
                                                   placeholder=""
                                                   maxLength="64"
                                                   value={this.state.content}
                                                   onChange={this.handleFieldChange}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="panel-footer text-right">
                    <button type="submit"
                            form="filter-form"
                            className="btn btn-primary">
                        <i className="glyphicon glyphicon-search"></i>
                        &nbsp;Search
                    </button>
                </div>
            </div>
        </section>;
    },
    componentDidMount: function () {

    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(_.cloneDeep(nextProps.query));
    },

    handleFieldChange: function (event) {
        var stateUpdate = {};
        stateUpdate[event.target.name] = event.target.value;

        this.setState(stateUpdate);
    },
    handleSubmitForm: function (event) {
        event.preventDefault();
        this.transitionTo('admin-posts-index', null, _.omit(this.state, _.isEmpty));
    }
});

module.exports = PostsFilter;