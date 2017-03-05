/**
 * upload file dialog
 */

import React from 'react';
import request from 'superagent';

import {autobind} from 'core-decorators';

import Modal from 'elemental/lib/components/Modal';
import ModalBody from 'elemental/lib/components/ModalBody';
import ModalHeader from 'elemental/lib/components/ModalHeader';
import ModalFooter from 'elemental/lib/components/ModalFooter';
import Button from 'elemental/lib/components/Button';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import Spinner from 'elemental/lib/components/Spinner';
import Glyph from 'elemental/lib/components/Glyph';
import Alert from 'elemental/lib/components/Alert';

import {convertFileToDataUrl} from '../../../utils/convert-blob-to-dataurl';

class UploadFileDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            filesToUpload: [],
            previewOfFiles: []
        };
    }

    componentDidMount() {
        this.setState({
            loading: false
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen && !nextProps.isOpen) {
            this.refs.fileInput.value = '';
            this.setState({
                error: null,
                filesToUpload: []
            });
        }
    }

    createPreview(ind) {
        if (!this.state.previewOfFiles[ind]) {
            return null;
        }
        return <div><img src={this.state.previewOfFiles[ind]} className="upload-dialog-image-preview"/></div>;
    }

    render() {
        let formId = 'jellyblog-file-upload-form';

        return <Modal width="medium" isOpen={this.props.isOpen} onCancel={this.onCancel}>
            <ModalHeader text="Upload file(s)" showCloseButton onClose={this.onCancel}/>
            <ModalBody>
                <Form id={formId} onSubmit={this.onFormSubmit} name={formId} method="POST">
                    <FormField label="Add attachments">
                        <input
                            type="file"
                            style={{'display': 'none'}}
                            ref="fileInput"
                            multiple={this.props.uploadMulti}
                            onChange={this.onFileInputChange}
                        />
                        <div>
                            <Button
                                type="primary"
                                onClick={this.onSelectFileClick}
                            >
                                <Glyph icon="file-add"/>
                                <span>Select file(s) to upload</span>
                            </Button>
                        </div>
                        <ol className="files-to-upload">
                            {this.state.filesToUpload.map((f, ind) => <li key={f.name}>
                                <b>{f.name}</b>
                                &nbsp;({f.size} bytes; {f.type})
                                {this.createPreview(ind)}
                            </li>)}
                        </ol>
                    </FormField>
                </Form>
                {this.state.error ?
                    <Alert type="danger"><strong>Error:</strong> {this.state.error.message}</Alert> : null}
            </ModalBody>
            <ModalFooter>
                <Button
                    type="link-cancel"
                    onClick={this.onCancel}
                    disabled={this.state.loading}
                >
                    <Glyph icon="circle-slash"/>
                    <span>Cancel</span>
                </Button>
                <Button
                    type="primary"
                    submit
                    form={formId}
                    disabled={!this.state.filesToUpload.length || this.state.loading}
                >
                    {this.state.loading ? <Spinner type="inverted"/> : <Glyph icon="cloud-upload"/>}
                    &nbsp;Upload
                </Button>
            </ModalFooter>
        </Modal>;
    }

    @autobind
    onCancel(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (this.state.loading) {
            return;
        }
        this.props.onReject('cancel');
    }

    @autobind
    onFormSubmit(e) {
        e.preventDefault();

        let self = this;
        let files = this.refs.fileInput.files;
        let formData = new FormData();
        let uploadFieldName = this.props.uploadFieldName || 'attachment';
        let uploadAdditionalData = this.props.uploadAdditionalData || {};
        let uploadUrl = this.props.uploadUrl || '/upload';

        for (let key in uploadAdditionalData) {
            if (uploadAdditionalData.hasOwnProperty(key)) {
                formData.append(key, uploadAdditionalData[key]);
            }
        }

        for (let key in files) {
            if (files.hasOwnProperty(key) && files[key] instanceof File) {
                formData.append(uploadFieldName, files[key]);
            }
        }

        this.setState({
            loading: true
        });

        request
            .post(uploadUrl)
            .send(formData)
            .then(res => {
                this.setState({
                    loading: false
                });
                if (res.status !== 200) {
                    throw new Error(res.status);
                }
                let uploadedFiles = res.body.files[uploadFieldName] || [];
                uploadedFiles = uploadedFiles.map(f => f.grid);
                self.props.onResolve(uploadedFiles);
            })
            .catch(err => {
                self.setState({
                    loading: false,
                    error: err
                });
            });
    }

    @autobind
    onFileInputChange(e) {
        let filesAsArray = Array.prototype.slice.call(e.target.files, 0);
        this.setState({
            filesToUpload: filesAsArray,
            previewOfFiles: new Array(e.target.files.length).fill(null)
        });
        this.updatePreview(filesAsArray);
    }

    @autobind
    updatePreview(filesAsArray) {
        let self = this;

        filesAsArray.forEach((file, ind) => {
            if (file.type.indexOf('image') === -1) {
                return;
            }
            convertFileToDataUrl(file)
                .then(dataUrl => {
                    if (!dataUrl) {
                        return dataUrl;
                    }

                    let currentPreviews = this.state.previewOfFiles;
                    currentPreviews[ind] = dataUrl;
                    self.setState({
                        previewOfFiles: currentPreviews
                    });
                });
        });
    }

    @autobind
    onSelectFileClick(e) {
        this.refs.fileInput.click();
    }

}

UploadFileDialog.propTypes = {
    // Use from decorator:
    isOpen: React.PropTypes.bool,                   // Modal visible
    onResolve: React.PropTypes.func,                // On cancel modal handler
    onReject: React.PropTypes.func,                 // On resolve dialog handler

    uploadMulti: React.PropTypes.bool,
    uploadFieldName: React.PropTypes.string,
    uploadAdditionalData: React.PropTypes.object,
    uploadUrl: React.PropTypes.string
};

UploadFileDialog.defaultProps = {
    uploadMulti: false,
    uploadFieldName: 'attachment',
    uploadAdditionalData: null,
    uploadUrl: '/upload'
};

export default UploadFileDialog;