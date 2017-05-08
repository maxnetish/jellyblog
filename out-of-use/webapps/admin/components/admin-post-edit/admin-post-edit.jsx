var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');

var commonDialogs = require('../../../common/components/common-dialogs/common-dialogs-service');
var componentFlux = require('./admin-post-edit-flux');

//var brace  = require('react-ace/node_modules/brace');
//var AceEditor  = require('react-ace');
//require('react-ace/node_modules/brace/mode/html');
//require('react-ace/node_modules/brace/theme/github');

var AceEditor = require('../ace-editor/ace-editor.jsx');
var AvatarCreator = require('../avatar-creator/avatar-creator.jsx');
var AvatarList = require('../avatar-list/avatar-list.jsx');
//var DatePicker = require('react-date-picker');
var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var Multiselect = require('react-widgets/lib/Multiselect');

function renderContentField(postDetails, handleChange) {
    return <div className="form-group">
        <label htmlFor="post-content" className="small control-label">
            Content
        </label>

        <div className="">
            <AceEditor ref="aceEditor" value={postDetails.content} onChange={handleChange}/>
        </div>
    </div>;
}

function renderTagsField(postDetails, handleTagsChange, allTags) {
    function handleCreateNewTag(newTag) {
        var newTags = _.clone(postDetails.tags);
        newTags.push(newTag);
        handleTagsChange(newTags);
    }

    return <div className="form-group">
        <label htmlFor="post-tags" className="small control-label">
            Tags
        </label>

        <div className="">
            <Multiselect className="multiselect-post-tags" value={postDetails.tags}
                         onChange={handleTagsChange}
                         onCreate={handleCreateNewTag}
                         data={allTags}/>
        </div>
    </div>;
}

function renderTitleField(postDetails, handleChange) {
    return <div className="form-group">
        <label htmlFor="post-title" className="small control-label">
            Title
        </label>

        <div className="">
            <input type="text"
                   className="form-control input-sm"
                   id="post-title"
                   name="title"
                   required
                   value={postDetails.title}
                   onChange={handleChange}/>
        </div>
    </div>;
}

function renderSlugField(postDetails, handleChange) {
    return <div className="form-group">
        <label htmlFor="post-slug" className="small control-label">
            Human url
        </label>

        <div className="input-group">
            <div className="input-group-addon">
                <small>/post/</small>
            </div>
            <input type="text"
                   className="form-control input-sm"
                   id="post-slug"
                   name="slug"
                   value={postDetails.slug}
                   onChange={handleChange}
                   placeholder={postDetails._id}/>
        </div>
    </div>;
}

function renderDateField(postDetails, handleDateChange) {
    var dateAsDate = new Date(postDetails.date);

    return <div className="form-group">
        <label htmlFor="post-date" className="small control-label">
            Date
        </label>
        <DateTimePicker value={dateAsDate}
                        className="post-date-edit"
                        onChange={handleDateChange}
                        culture={moment.locale()}/>
    </div>;
}

function renderMetaTitleField(postDetails, handleChange) {
    return <div className="form-group">
        <label htmlFor="post-metatitle"
               className="small control-label">
            Meta title
        </label>

        <div className="">
            <input type="text"
                   className="form-control input-sm"
                   id="post-metatitle"
                   name="metaTitle"
                   value={postDetails.metaTitle}
                   onChange={handleChange}/>
        </div>
    </div>;
}

function renderMetaDescriptionField(postDetails, handleChange) {
    return <div className="form-group">
        <label htmlFor="post-metadescription"
               className="small control-label">
            Meta description
        </label>

        <div className="">
            <input type="text"
                   className="form-control input-sm"
                   id="post-metadescription"
                   name="metaDescription"
                   value={postDetails.metaDescription}
                   onChange={handleChange}/>
        </div>
    </div>;
}

function renderPostAvatarField(postDetails, handleCreateAvatarToggle, handleAvatarApply, handleAvatarSelect, createAvatarVisible) {
    return <div className="form-group">
        <label className="small control-label">
            Post title image
        </label>

        <div>
            <div className="media">
                <div className="media-left">
                    <img src={postDetails.image} className="media-object" style={{height:'100px',width:'100px'}}/>
                </div>
                <div className="media-body">
                    <a href="javascript:void 0" className="create-avatar-button" onClick={handleCreateAvatarToggle}>
                        <i className="caret caret-creator-toggle"></i>
                        <span>{createAvatarVisible ? 'Cancel' : 'Create new image'}</span>
                    </a>
                    {createAvatarVisible ?
                        <div>
                            <AvatarCreator onApply={handleAvatarApply} width={100} height={100} border={25}/>
                        </div> :
                        <div>
                            <span>Or choose from existing:</span>
                            <AvatarList previewStyle={{height:'50px', width:'50px'}} onSelect={handleAvatarSelect}/>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>;
}

function renderDraftField(postDetails, handleChange) {
    return <div className="checkbox btn">
        <label className="small">
            <input type="checkbox"
                   name="draft"
                   checked={postDetails.draft}
                   onChange={handleChange}/>
            &nbsp;<strong>Draft</strong>
        </label>
    </div>;
}

function renderPostEdit(postDetails, pristine, handleFieldChange, handleContentChange, handleCreateAvatarToggle, handleAvatarApply, handleAvatarSelect, createAvatarVisible, handleDateChange, handleTagsChange, handleFormSubmit, handlePostRemove, allTags) {
    var saveButtonClass = ClassSet({
        'btn btn-block': true,
        'btn-primary': postDetails.draft,
        'btn-success': !postDetails.draft
    });
    var saveButtonIconClass = ClassSet({
        'glyphicon': true,
        'glyphicon-share': !postDetails.draft,
        'glyphicon-save': postDetails.draft
    });
    var saveButtonText = postDetails.draft ? 'Save as draft' : 'Save & pub';

    return <div className="panel panel-default">
        <div className="panel-heading">
            <div className="row">
                <div className="col-sm-7">
                    <h3 className="panel-title">{postDetails.title}</h3>
                </div>
                <div className="col-sm-2">
                    {renderDraftField(postDetails, handleFieldChange)}
                </div>
                <div className="col-sm-3">
                    <button type="submit"
                            form="post-edit"
                            disabled={pristine}
                            className={saveButtonClass}>
                        <i className={saveButtonIconClass}></i>
                        &nbsp;{saveButtonText}
                    </button>
                    <div className="alert alert-danger post-delete-link-ct">
                        <a href="javascript:void 0" className="alert-link" onClick={handlePostRemove}>
                            <small>Delete</small>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div className="panel-body">
            <form name="post-edit" id="post-edit" onSubmit={handleFormSubmit}>
                <div className="row">
                    <div className="col-sm-6">
                        {renderSlugField(postDetails, handleFieldChange)}
                    </div>
                    {/*renderDraftField(postDetails, handleFieldChange)*/}
                    <div className="col-sm-6">
                        {renderDateField(postDetails, handleDateChange)}
                    </div>
                </div>
                <div className="">
                    {renderTitleField(postDetails, handleFieldChange)}
                    {renderContentField(postDetails, handleContentChange)}
                    {renderTagsField(postDetails, handleTagsChange, allTags)}
                    {renderPostAvatarField(postDetails, handleCreateAvatarToggle, handleAvatarApply, handleAvatarSelect, createAvatarVisible)}
                    {renderMetaTitleField(postDetails, handleFieldChange)}
                    {renderMetaDescriptionField(postDetails, handleFieldChange)}
                </div>
            </form>

            {/*
             <div className="post-content-preview"
             dangerouslySetInnerHTML={{__html: postDetails.content}}>
             </div>
             */}
        </div>
    </div>
        ;
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
                renderPostEdit(this.state.post, this.state.pristine, this.handleFieldChange, this.handleContentChange, this.handleCreateAvatarToggle, this.handleAvatarApply, this.handleAvatarSelect, this.state.createAvatarVisible, this.handleDateChange, this.handleTagsChange, this.handleFormSubmit, this.handlePostRemove, this.state.tags) :
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
        var fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        var payload = {};
        payload[fieldName] = fieldValue;
        componentFlux.actions.postFieldChanged(payload);
    },
    handleContentChange: function (event) {
        var oldContent = (this.state.post && this.state.post.content) || '';
        var newContent = event.src.getValue() || '';

        if (oldContent === newContent) {
            return;
        }

        var payload = {
            content: newContent
        };
        componentFlux.actions.postFieldChanged(payload);
    },
    handleCreateAvatarToggle: function (event) {
        this.setState({
            createAvatarVisible: !this.state.createAvatarVisible
        });
    },
    handleAvatarApply: function (event) {
        componentFlux.actions.applyPostImage(event.image);
        this.setState({
            createAvatarVisible: false
        });
    },
    handleAvatarSelect: function (event) {
        componentFlux.actions.postFieldChanged({
            image: event.url
        });
    },
    handleDateChange: function (dateAsDate) {
        componentFlux.actions.postFieldChanged({
            date: dateAsDate.toString()
        });
    },
    handleTagsChange: function (newTags) {
        componentFlux.actions.postFieldChanged({
            tags: _.clone(newTags)
        });
    },
    handleFormSubmit: function (event) {
        event.preventDefault();
        if (this.state.post && this.state.post._id === 'NEW') {
            componentFlux.actions.postCreate(this.state.post);
        } else {
            componentFlux.actions.postUpdate(this.state.post);
        }
    },
    handlePostRemove: function (event) {
        var self = this;

        if (this.state.post && this.state.post._id === 'NEW') {
            return;
        }

        commonDialogs.confirm({
            message: 'Remove post "' + this.state.post.title + '" forever?',
            title: 'Delete post'
        })
            .then(function () {
                componentFlux.actions.postRemove(self.state.post._id);
            });
    },

    onStoreChanged: function (newViewModel) {
        this.setState(newViewModel);
    }
});

module.exports = AdminPostEdit;