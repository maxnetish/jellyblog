import React from 'react';

import request from 'superagent';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import FormRow from 'elemental/lib/components/FormRow';
import Radio from 'elemental/lib/components/Radio';
// import FileUpload from 'elemental/lib/components/FileUpload';
import {Creatable} from 'react-select';
import AvatarEditor from 'react-avatar-editor';

import classnames from 'classnames';

import $filter from '../../../filter';

class PostForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filesToUpload: [],
            addAvatarSource: null,
            addAvatarScale: 1
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
                        <Creatable
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
                    <FormField label="Attachments" width="one-third">
                        {this.props.value.attachments ?
                            <ol className="files-attached">
                                {this.props.value.attachments.map(a => <li key={a._id}>
                                    <a
                                        href={`/file/${a.filename}`}
                                        target="_blank"
                                    >
                                        <b>{a.metadata.originalName}</b>
                                    </a>
                                    &nbsp;({a.length} bytes; {a.contentType})&nbsp;
                                    <Button
                                        type="link-delete"
                                        onClick={this.onRemoveAttachmentClick.bind(this, a._id)}>
                                        <Glyph icon="trashcan"/>
                                    </Button>
                                </li>)}
                            </ol> : null}
                    </FormField>
                    <FormField label="Add attachments" width="two-thirds">
                        <input
                            type="file"
                            style={{'display': 'none'}}
                            ref="fileInput"
                            multiple
                            onChange={this.onFileInputChange.bind(this)}
                        />
                        <Button
                            type="primary"
                            onClick={this.onSelectFileClick.bind(this)}
                        >
                            <Glyph icon="file-add"/>
                            <span>Select file(s) to upload</span>
                        </Button>
                        <ol className="files-to-upload">
                            {this.state.filesToUpload.map(f => <li key={f.name}><b>{f.name}</b> ({f.size}
                                bytes; {f.type})</li>)}
                        </ol>
                        {
                            this.state.filesToUpload.length ?
                                <Button
                                    type="primary"
                                    onClick={this.onFileUploadClick.bind(this)}
                                >
                                    <Glyph icon="cloud-upload"/>
                                    <span>Upload</span>
                                </Button>
                                : null
                        }
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Add avatar">
                        <div style={{width: 200, height: 200}}>
                            <AvatarEditor
                                image={this.state.addAvatarSource}
                                ref="avatarEditor"
                                width={100}
                                height={100}
                                border={50}
                                color={[32, 64, 64, 0.6]} // RGBA
                                scale={this.state.addAvatarScale}
                            />
                        </div>
                        <div style={{width: 200}}>
                            <input
                                className="range-form-control"
                                type="range"
                                max="10"
                                min="1"
                                step="0.1"
                                value={this.state.addAvatarScale}
                                onChange={this.onAddAvatarScaleChange.bind(this)}
                            />
                        </div>
                        <input
                            type="file"
                            style={{'display': 'none'}}
                            ref="addAvatarFileInput"
                            accept="image/*"
                            onChange={this.onAddAvatarFileInputChange.bind(this)}
                        />
                        <div>
                            <Button
                                type="primary"
                                onClick={this.onAddAvatarSelectFileClick.bind(this)}
                                title="Select file to make avatar from"
                            >
                                <Glyph icon="file-media"/>
                                <span>Select file</span>
                            </Button>
                        </div>
                        <div className="text-right">
                            {this.state.addAvatarSource ?
                                <Button
                                    type="success"
                                    onClick={this.onAddAvatarApplyClick.bind(this)}
                                    title="Apply and save new avatar"
                                >
                                    <Glyph icon="cloud-upload"/>
                                    <span>Apply</span>
                                </Button> : null
                            }
                        </div>
                    </FormField>
                </FormRow>
            </Form>
        </div>;

        // accept="image/jpg, image/gif, image/png"
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

    onSelectFileClick(e) {
        this.refs.fileInput.click();
    }

    onFileInputChange(e) {
        this.setState({
            filesToUpload: Array.prototype.slice.call(e.target.files, 0)
        });
    }

    onFileUploadClick(e) {
        let files = this.refs.fileInput.files;
        let formData = new FormData();

        for (let key in files) {
            if (files.hasOwnProperty(key) && files[key] instanceof File) {
                formData.append('attachment', files[key]);
            }
        }

        formData.append('context', 'postAttachment');
        formData.append('postId', this.props.value._id);

        request
            .post('/upload')
            .send(formData)
            .then(res => {
                if (res.status !== 200) {
                    throw new Error(res.status);
                }
                let uploadedFiles = res.body.files.attachment || [];
                let existentAttachment = this.props.value.attachments || [];
                this.props.onChange({
                    attachments: existentAttachment.concat(uploadedFiles.map(f => f.grid))
                });
                this.setState({
                    filesToUpload: []
                });
            })
            .catch(err => console.warn(err));
    }

    onRemoveAttachmentClick(attachmentId, e) {
        let existentAttachment = this.props.value.attachments || [];
        this.props.onChange({
            attachments: existentAttachment.filter(a => a._id !== attachmentId)
        });
    }

    onAddAvatarSelectFileClick(e) {
        this.refs.addAvatarFileInput.click();
    }

    onAddAvatarScaleChange(e) {
        this.setState({
            addAvatarScale: parseFloat(e.target.value)
        });
    }

    onAddAvatarFileInputChange(e) {
        let targetInput = e.target;
        let reader;
        let self = this;

        if (!(targetInput.files && targetInput.files[0])) {
            return;
        }

        reader = new FileReader();

        reader.onload = loadEvent => {
            let dataUri = loadEvent.target.result;
            self.setState({
                addAvatarSource: dataUri
            });
        };

        reader.onerror = event => console.warn(`File could not be read! Code ${event.target.error.code}`);

        reader.readAsDataURL(targetInput.files[0]);
    }

    // onAddAvatarCancelClick(e) {
    //     this.setState({
    //         addAvatarSource: null
    //     });
    // }

    onAddAvatarApplyClick(e) {
        // let blob = convertDataUrl2Blob(this.refs.avatarEditor.getImage());
        let self = this;
        this.refs.avatarEditor.getImage().toBlob(blob => {
            let formData = new FormData();

            formData.append('avatarImage', blob, self.refs.addAvatarFileInput.files[0].name);

            formData.append('context', 'avatarImage');
            formData.append('width', '100');
            formData.append('height', '100');

            request
                .post('/upload')
                .send(formData)
                .then(res => {
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    let uploadedFile = res.body.files.avatarImage || [];
                    console.info(uploadedFile);
                })
                .catch(err => console.warn(err));
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