var React = require('react/addons');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');

var componentFlux = require('./admin-post-edit-flux');

//var brace  = require('react-ace/node_modules/brace');
//var AceEditor  = require('react-ace');
//require('react-ace/node_modules/brace/mode/html');
//require('react-ace/node_modules/brace/theme/github');

var AceEditor=require('../ace-editor/ace-editor.jsx');


function renderContentField(postDetails, handleChange) {
    return <div className="form-group">
        <label ref="another" htmlFor="post-content" className="small control-label">
            Content
        </label>

        <div className="">

            <AceEditor ref="aceEditor" value={postDetails.content} onChange={handleChange}/>
            {/*
            <textarea name="content"
                  id="post-content"
                  className="form-control"
                  value={postDetails.content}
                  onChange={handleFieldChange}></textarea>
                  */}
        </div>
    </div>;
}

function renderPostEdit(postDetails, handleFieldChange, handleContentChange) {
    return <div className="panel panel-default">
        <div className="panel-heading">
            {postDetails.title}
        </div>
        <div className="panel-body">
            <form name="post-edit" id="post-edit">
                <div className="">
                    {renderContentField(postDetails, handleContentChange)}
                </div>
            </form>

            {/*
            <div className="post-content-preview"
                 dangerouslySetInnerHTML={{__html: postDetails.content}}>
            </div>
            */}
        </div>
    </div>;
}

var AdminPostEdit = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getDefaultProps: function () {
        return {
            postId: null
        };
    },
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <section className="admin-post-edit">
            {this.state.post ?
                renderPostEdit(this.state.post, this.handleFieldChange, this.handleContentChange) :
                <div className="alert alert-warning" role="alert">Choose post to edit or create new one</div>
            }
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted(this.props.postId);
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    componentWillReceiveProps: function (nextProps) {
        componentFlux.actions.queryChanged(nextProps.postId);
    },

    handleFieldChange: function (event) {
        var fieldName = event.target.name;
        var fieldValue = event.target.value;
        var payload = {};
        payload[fieldName] = fieldValue;
        componentFlux.actions.postFieldChanged(payload);
    },
    handleContentChange: function(event){
        var payload = {
            content: event.src.getValue()
        };
        componentFlux.actions.postFieldChanged(payload);
    },

    onStoreChanged: function (newViewModel) {
        this.setState(newViewModel);
    }
});

module.exports = AdminPostEdit;