import React                from 'react';

import Button               from 'elemental/lib/components/Button';
import Glyph                from 'elemental/lib/components/Glyph';
import Form                 from 'elemental/lib/components/Form';
import FormField            from 'elemental/lib/components/FormField';
import FormInput            from 'elemental/lib/components/FormInput';
import FormRow              from 'elemental/lib/components/FormRow';
import Radio                from 'elemental/lib/components/Radio';
// import FileUpload from 'elemental/lib/components/FileUpload';

// may be move to https://github.com/bvaughn/react-virtualized-select/
import Select               from 'react-select';
import UploadFileDialog     from '../upload-file-dialog';
import CreateAvatarDialog   from '../create-image-dialog';
import ImageLibrary         from '../admin-image-library';

import classnames           from 'classnames';

import fileStoreConfig      from '../../../../config/file-store.json';
import $filter              from '../../../filter';

class PostForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uploadFileDialogVisible: false,
            createAvatarDialogVisible: false
        };
    }

    render() {
        console.info('Post Form render: ', this.props);

        let postStatusClass = classnames({
            'inline-form-statics': true,
            'post-status-form': true,
            'jb-badge': true,
            'info': this.props.value.status === 'DRAFT',
            'success': this.props.value.status === 'PUB'
        });

        return <div className="post-edit-form">
            <h3>Edit post</h3>
            <div className="form-statics-ct">
                <div className={postStatusClass}>
                    {$filter('postStatus')(this.props.value.status)}
                </div>
                <div className="inline-form-statics">
                    <span>Created: </span>
                    <time
                        dateTime={this.props.value.createDate}>
                        {$filter('dateAndTime')(this.props.value.createDate)}
                    </time>
                </div>
                <div className="inline-form-statics">
                    <span>Updated: </span>
                    <time
                        dateTime={this.props.value.updateDate}>
                        {$filter('dateAndTime')(this.props.value.updateDate)}
                    </time>
                </div>
                <div className="inline-form-statics">
                    <span>Author: </span>
                    <b>{this.props.value.author}</b>
                </div>
                <div className="inline-form-statics">
                    <span>Id: </span>
                    <b>{this.props.value._id}</b>
                </div>
            </div>
            <hr/>
            <Form type="horizontal">
                <FormRow>
                    <FormField label="Title"
                               htmlFor="title">
                        <FormInput type="text"
                                   placeholder="Enter post title"
                                   name="title"
                                   value={this.props.value.title || ''}
                                   id="title"
                                   onChange={this.onInputChanged.bind(this)}/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Brief annotation"
                               htmlFor="brief">
                        <FormInput type="text"
                                   placeholder="Enter post annotaion"
                                   name="brief"
                                   value={this.props.value.brief || ''}
                                   id="brief"
                                   onChange={this.onInputChanged.bind(this)}
                                   multiline
                                   className="form-textarea-brief"/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Post content"
                               htmlFor="content">
                        <FormInput type="text"
                                   placeholder="Enter post content"
                                   name="content"
                                   value={this.props.value.content || ''}
                                   id="content"
                                   onChange={this.onInputChanged.bind(this)}
                                   multiline
                                   className="form-textarea-content"/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Content type" width="one-third">
                        <div className="inline-controls">
                            <Radio name="contentType"
                                   label="HTML"
                                   value="HTML"
                                   checked={this.props.value.contentType === 'HTML'}
                                   onChange={this.onRadioChange.bind(this)}/>
                            <Radio name="contentType"
                                   label="Markdown MD"
                                   value="MD"
                                   checked={this.props.value.contentType === 'MD'}
                                   onChange={this.onRadioChange.bind(this)}/>
                        </div>
                    </FormField>
                    <FormField label="Tags" width="two-thirds">
                        <Select.Creatable
                            name="tags"
                            multi={true}
                            value={this.props.value.tags}
                            options={this.props.tags}
                            onChange={this.onSelectTagsChange.bind(this)}
                            promptTextCreator={this.onPromptTextCreator.bind(this)}
                            isLoading={this.props.loadingTags}
                        />
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Attachments">
                        <div>
                            <Button type="primary" onClick={this.onAddAttachmentsClick.bind(this)}>
                                <Glyph icon="file-add"/>
                                <span>Add attachments</span>
                            </Button>
                        </div>
                        <UploadFileDialog
                            isOpen={this.state.uploadFileDialogVisible}
                            onCancel={this.onUploadDialogCancel.bind(this)}
                            onFullfill={this.onUploadDialogFullfill.bind(this)}
                            uploadMulti={true}
                            uploadFieldName="attachment"
                            uploadAdditionalData={{context: 'postAttachment', postId: this.props.value._id}}
                        />
                        {this.props.value.attachments ?
                            <ol className="files-attached">
                                {this.props.value.attachments.map(a => <li key={a._id}>
                                    <a
                                        href={`${fileStoreConfig.gridFsBaseUrl}/${a.filename}`}
                                        target="_blank"
                                    >
                                        <b>{a.metadata.originalName}</b>
                                    </a>
                                    &nbsp;({a.length} bytes; {a.contentType})&nbsp;
                                    <Button
                                        type="link-delete"
                                        onClick={this.onRemoveAttachmentClick.bind(this, a._id)}
                                        title="Remove attachment"
                                    >
                                        <Glyph icon="trashcan"/>
                                    </Button>
                                </li>)}
                            </ol> : null}
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Choose avatar for post" width="two-thirds">
                        <Select
                            options={[{value: 'opt-1', label: 'Option 1', data: 'bla bla'}]}
                        />
                    </FormField>
                    <FormField label="Add avatar" width="one-third">
                        <div>
                            <Button type="primary" onClick={this.onAddAvatarClick.bind(this)}>
                                <Glyph icon="file-add"/>
                                <span>Add avatar</span>
                            </Button>
                        </div>
                        <CreateAvatarDialog
                            isOpen={this.state.createAvatarDialogVisible}
                            onCancel={this.onCreateAvatarDialogCancel.bind(this)}
                            onFullfill={this.onCreateAvatarDialogFullfill.bind(this)}
                        />
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="image for post title">
                        <ImageLibrary
                            value={this.state.titleImageFile}
                            onChange={this.imageLibraryOnChange.bind(this)}
                        />
                    </FormField>
                </FormRow>
            </Form>
        </div>;

        // accept="image/jpg, image/gif, image/png"
    }

    imageLibraryOnChange(e) {
        this.setState({
            titleImageFile: e
        });
    }

    onInputChanged(e) {
        this.props.onChange({
            [e.target.name]: e.target.value
        });
    }

    onRadioChange(e) {
        if (e.target.checked) {
            this.props.onChange({
                [e.target.name]: e.target.value
            });
        }
    }

    onSelectTagsChange(e) {
        console.info('Select Tag Change: ', e);
        this.props.onChange({
            tags: e
        });
    }

    onPromptTextCreator(e) {
        return `Add new tag "${e}"`;
    }

    onAddAttachmentsClick(e) {
        this.setState({
            uploadFileDialogVisible: true
        });
    }

    onUploadDialogCancel(e) {
        this.setState({
            uploadFileDialogVisible: false
        });
    }

    onUploadDialogFullfill(uploadedFiles) {
        let existentAttachment = this.props.value.attachments || [];
        this.props.onChange({
            attachments: existentAttachment.concat(uploadedFiles)
        });
        this.setState({
            uploadFileDialogVisible: false
        });
    }

    onRemoveAttachmentClick(attachmentId, e) {
        let existentAttachment = this.props.value.attachments || [];
        this.props.onChange({
            attachments: existentAttachment.filter(a => a._id !== attachmentId)
        });
    }

    onAddAvatarClick(e) {
        this.setState({
            createAvatarDialogVisible: true
        });
    }

    onCreateAvatarDialogCancel(e) {
        this.setState({
            createAvatarDialogVisible: false
        });
    }

    onCreateAvatarDialogFullfill(e) {
        console.info('Create avatar: ', e);
        this.setState({
            createAvatarDialogVisible: false
        });
    }
}

PostForm.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    tags: React.PropTypes.array,
    loadingTags: React.PropTypes.bool
};

export default PostForm;