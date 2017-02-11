import React                from 'react';

import Button               from 'elemental/lib/components/Button';
import Glyph                from 'elemental/lib/components/Glyph';
import Form                 from 'elemental/lib/components/Form';
import FormField            from 'elemental/lib/components/FormField';
import FormInput            from 'elemental/lib/components/FormInput';
import FormRow              from 'elemental/lib/components/FormRow';
import Radio                from 'elemental/lib/components/Radio';
import Row                  from 'elemental/lib/components/Row';
import Col                  from 'elemental/lib/components/Col';

import marked               from 'marked'

// may be move to https://github.com/bvaughn/react-virtualized-select/
import Select               from 'react-select';
import UploadFileDialog     from '../upload-file-dialog';
import ImageLibrary         from '../admin-image-library';

import classnames           from 'classnames';
import {autobind}           from 'core-decorators';
import modalDialogDecorator from '../../../utils/modal-dialog-decorator';
import hasDom               from '../../../utils/has-dom';
import noop                 from '../../../utils/no-op';

import fileStoreConfig      from '../../../../config/file-store.json';
import $filter              from '../../../filter';

const uploadFileModal = {};

let AceEditor;
const aceThemes = [
    'github',
    'dawn',
    'clouds',
    'katzenmilch',
    'chrome',
    'textmate',
    'twilight',
    'xcode'
];
const aceContentEditorModeMap = {
    'MD': 'markdown',
    'HTML': 'html'
};
if (hasDom()) {
    AceEditor = require('react-ace').default;
    require('brace');

    require('brace/mode/markdown');
    require('brace/mode/html');

    require('brace/theme/github');
    require('brace/theme/dawn');
    require('brace/theme/clouds');
    require('brace/theme/katzenmilch');
    require('brace/theme/chrome');
    require('brace/theme/textmate');
    require('brace/theme/twilight');
    require('brace/theme/xcode');

    // aceThemes.forEach(t => require(`brace/theme/${t}`));
    // require('brace/theme/twilight');
}

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});

@modalDialogDecorator({modal: uploadFileModal, component: UploadFileDialog})
export default class PostForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentEditorTheme: {id: 'github'},
            contentEditorThemes: aceThemes.map(t => {
                return {id: t};
            }),
            contentTypePresentMode: 'PREVIEW'
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

        let contentElement;
        switch (this.state.contentTypePresentMode) {
            case 'SOURCE':
                contentElement = <div>
                    <Row className="_margin-5 _bottom">
                        <Col xs="25%">
                            <div className="relative-100-zindex">
                                <Select
                                    name="content-editor-theme"
                                    multi={false}
                                    value={this.state.contentEditorTheme}
                                    options={this.state.contentEditorThemes}
                                    onChange={this.onChangeContentEditorTheme}
                                    labelKey="id"
                                    valueKey="id"
                                    clearable={false}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="_margin-5 _bottom">
                        <Col xs="100%">
                            <div className="jb-form-element-border _padding-5 _all">
                                {AceEditor ? <AceEditor
                                        mode={aceContentEditorModeMap[this.props.value.contentType]}
                                        theme={this.state.contentEditorTheme.id}
                                        height="300px"
                                        width="100%"
                                        fontSize={14}
                                        showGutter={false}
                                        showPrintMargin={false}
                                        highlightActiveLine={true}
                                        focus={false}
                                        cursorStart={1}
                                        wrapEnabled={true}
                                        readOnly={false}
                                        minLines={null}
                                        maxLines={null}
                                        enableBasicAutocompletion={true}
                                        enableLiveAutocompletion={false}
                                        tabSize={4}
                                        value={this.props.value.content}
                                        defaultValue={this.props.value.content}
                                        onLoad={noop}
                                        onBeforeLoad={noop}
                                        onChange={this.onContentChange}
                                        name="content-of-post"
                                        editorProps={{$blockScrolling: true}}
                                    /> : null}
                            </div>
                        </Col>
                    </Row>
                </div>;
                break;
            case 'PREVIEW':
                contentElement = <div>
                    <Row className="_margin-5 _bottom">
                        <Col xs="100%">
                            <div
                                className="jb-form-element-border _padding-5 _all"
                                dangerouslySetInnerHTML={this.getHtmlForContentPreview()}
                            >
                            </div>
                        </Col>
                    </Row>
                </div>;
                break;
        }

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
                        <Row>
                            <Col xs="100%">
                                <div className="inline-controls">
                                    <Radio name="contentTypePresentMode"
                                           label="Source"
                                           value="SOURCE"
                                           checked={this.state.contentTypePresentMode === 'SOURCE'}
                                           onChange={this.onContentTypePresentModeRadioChange}
                                    />
                                    <Radio name="contentTypePresentMode"
                                           label="Preview"
                                           value="PREVIEW"
                                           checked={this.state.contentTypePresentMode === 'PREVIEW'}
                                           onChange={this.onContentTypePresentModeRadioChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {contentElement}
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

    @autobind
    getHtmlForContentPreview() {
        let parsed;
        switch(this.props.value.contentType){
            case 'HTML':
                parsed = this.props.value.content;
                break;
            case 'MD':
                parsed = marked(this.props.value.content);
                break;
        }
        return {
            __html: parsed
        };
    }

    @autobind
    onContentTypePresentModeRadioChange(e) {
        this.setState({
            contentTypePresentMode: e.target.value
        });
    }

    @autobind
    onChangeContentEditorTheme(e) {
        this.setState({
            contentEditorTheme: e
        });
    }

    tagsSelectNewOptionCreator({label, labelKey, valueKey}) {
        let result = {
            [valueKey]: 'new_tag_' + label,
            [labelKey]: label
        };
        return result;
    }

    @autobind
    onContentChange(e) {
        console.log(`Content change: `, e);
        this.props.onChange({
            content: e
        });
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