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
import ImageLibrary         from '../admin-image-library';

import classnames           from 'classnames';
import {autobind}           from 'core-decorators';
import modalDialogDecorator from '../../../utils/modal-dialog-decorator';

import fileStoreConfig      from '../../../../config/file-store.json';
import $filter              from '../../../filter';

const uploadFileModal = {};

@modalDialogDecorator({modal: uploadFileModal, component: UploadFileDialog})
export default class PostForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
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
                                   onChange={this.onInputChanged}/>
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
                                   onChange={this.onInputChanged}
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
                                   onChange={this.onInputChanged}
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
                                   onChange={this.onRadioChange}/>
                            <Radio name="contentType"
                                   label="Markdown MD"
                                   value="MD"
                                   checked={this.props.value.contentType === 'MD'}
                                   onChange={this.onRadioChange}/>
                        </div>
                    </FormField>
                    <FormField label="Tags" width="two-thirds">
                        <Select.Creatable
                            name="tags"
                            multi={true}
                            value={this.props.value.tags}
                            options={this.props.tags}
                            onChange={this.onSelectTagsChange}
                            promptTextCreator={this.onPromptTextCreator}
                            isLoading={this.props.loadingTags}
                            newOptionCreator={this.tagsSelectNewOptionCreator}
                            labelKey="value"
                            valueKey="_id"
                        />
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Attachments">
                        <div>
                            <Button type="primary" onClick={this.onAddAttachmentsClick}>
                                <Glyph icon="file-add"/>
                                <span>Add attachments</span>
                            </Button>
                        </div>
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
                    <FormField label="Image for post title" width="two-thirds">
                        <ImageLibrary
                            value={this.props.value.titleImg}
                            onChange={this.imageLibraryOnChange}
                        />
                    </FormField>
                </FormRow>
            </Form>
            {this.props.children}
        </div>;

        // accept="image/jpg, image/gif, image/png"
    }

    tagsSelectNewOptionCreator({label, labelKey, valueKey}){
        let result = {
            [valueKey]: 'new_tag_' + label,
            [labelKey]: label
        };
        return result;
    }

    @autobind
    imageLibraryOnChange(e) {
        this.props.onChange({
            titleImg: e
        });
    }

    @autobind
    onInputChanged(e) {
        this.props.onChange({
            [e.target.name]: e.target.value
        });
    }

    @autobind
    onRadioChange(e) {
        if (e.target.checked) {
            this.props.onChange({
                [e.target.name]: e.target.value
            });
        }
    }

    @autobind
    onSelectTagsChange(e) {
        this.props.onChange({
            tags: e
        });
    }

    @autobind
    onPromptTextCreator(e) {
        let result = `Add new tag "${e}"`;
        return result;
    }

    @autobind
    onAddAttachmentsClick(e) {
        let self = this;
        uploadFileModal
            .show({
                uploadMulti: true,
                uploadFieldName: 'attachment',
                uploadAdditionalData: {
                    context: 'postAttachment',
                    postId: this.props.value._id
                }
            })
            .then(uploadedFiles => {
                let existentAttachment = this.props.value.attachments || [];
                self.props.onChange({
                    attachments: existentAttachment.concat(uploadedFiles)
                });
            })
            .catch(err => {
                if (['no', 'cancel'].indexOf(err) !== -1) {
                    return;
                }
                console.warn(err);
            });
    }

    @autobind
    onRemoveAttachmentClick(attachmentId, e) {
        let existentAttachment = this.props.value.attachments || [];
        this.props.onChange({
            attachments: existentAttachment.filter(a => a._id !== attachmentId)
        });
    }
}

PostForm.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    tags: React.PropTypes.array,
    loadingTags: React.PropTypes.bool
};

// @fooDialog({modalHook: modalHook})
// export default PostForm;