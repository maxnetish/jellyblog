/**
 * resize crop and upload avatar image
 */

import React from 'react';
import request from 'superagent';

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
import AvatarEditor from 'react-avatar-editor';

class CreateAvatarDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            avatarSource: null,
            avatarScale: 1
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
                loading: false,
                avatarSource: null
            });
        }
    }

    render() {
        let formId = 'jellyblog-create-avatar-form';
        let avatarHeight = this.props.avatarHeight || 100;
        let avatarWidth = this.props.avatarWidth || 100;
        let borderWidth = 50;
        let controlWidth = avatarWidth + 2 * borderWidth;
        let controlHeight = avatarHeight + 2 * borderWidth;
        let modalWidth = controlWidth + 40;

        return <Modal
            className="jb-create-avatar-dialog"
            width={modalWidth}
            isOpen={this.props.isOpen}
            onCancel={this.onCancel.bind(this)}
        >
            <ModalHeader text="Create avatar" showCloseButton onClose={this.onCancel.bind(this)}/>
            <ModalBody>
                <Form id={formId} onSubmit={this.onFormSubmit.bind(this)} name={formId} method="POST">
                    <input
                        type="file"
                        style={{'display': 'none'}}
                        ref="fileInput"
                        accept="image/*"
                        onChange={this.onFileInputChange.bind(this)}
                    />
                    <div>
                        <Button
                            type="primary"
                            onClick={this.onSelectFileClick.bind(this)}
                            title="Select file to make avatar from"
                        >
                            <Glyph icon="file-media"/>
                            <span>Select file</span>
                        </Button>
                    </div>
                    <FormField label="Avatar editor">
                        <div className="avatar-editor-wrapper">
                            <div style={{width: controlWidth, height: controlHeight}}>
                                <AvatarEditor
                                    image={this.state.avatarSource}
                                    ref="avatarEditor"
                                    width={avatarWidth}
                                    height={avatarHeight}
                                    border={borderWidth}
                                    color={[32, 64, 64, 0.6]} // RGBA
                                    scale={this.state.avatarScale}
                                />
                            </div>
                            <div style={{width: controlWidth}}>
                                <input
                                    className="range-form-control"
                                    type="range"
                                    max="10"
                                    min="1"
                                    step="0.1"
                                    value={this.state.avatarScale}
                                    onChange={this.onAvatarScaleChange.bind(this)}
                                />
                            </div>
                        </div>
                    </FormField>
                </Form>
                {this.state.error ?
                    <Alert type="danger"><strong>Error:</strong> {this.state.error.message}</Alert> : null}
            </ModalBody>
            <ModalFooter>
                <Button
                    type="link-cancel"
                    onClick={this.onCancel.bind(this)}
                    disabled={this.state.loading}
                >
                    <Glyph icon="circle-slash"/>
                    <span>Cancel</span>
                </Button>
                <Button
                    type="primary"
                    submit
                    form={formId}
                    disabled={!this.state.avatarSource || this.state.loading}
                >
                    {this.state.loading ? <Spinner type="inverted"/> : <Glyph icon="cloud-upload"/>}
                    &nbsp;Apply
                </Button>
            </ModalFooter>
        </Modal>;
    }

    onCancel(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (this.state.loading) {
            return;
        }
        this.props.onCancel();
    }

    onFormSubmit(e) {
        e.preventDefault();

        let self = this;
        let retrieveCanvas = 'getImageScaledToCanvas';
        // let retrieveCanvas = 'getImage';

        this.setState({
            loading: true
        });

        this.refs.avatarEditor[retrieveCanvas]().toBlob(blob => {
            let formData = new FormData();
            let uploadUrl = this.props.uploadUrl || '/upload';
            let avatarHeight = self.props.avatarHeight || 100;
            let avatarWidth = self.props.avatarWidth || 100;

            formData.append('context', 'avatarImage');
            formData.append('width', '' + avatarWidth);
            formData.append('height', '' + avatarHeight);

            formData.append('avatarImage', blob, self.refs.fileInput.files[0].name);

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
                    let uploadedFile = res.body.files.avatarImage || [];
                    uploadedFile = uploadedFile.map(f => f.grid);
                    self.props.onFullfill(uploadedFile);
                })
                .catch(err => {
                    self.setState({
                        error: {
                            message: `Load image failed: code:${event.target.error.code}`
                        },
                        loading: false
                    });
                });
        });
    }

    onFileInputChange(e) {
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
                avatarSource: dataUri
            });
        };

        reader.onerror = event => {
            self.setState({
                error: {
                    message: `Load image failed: code:${event.target.error.code}`
                }
            });
        };

        reader.readAsDataURL(targetInput.files[0]);
    }

    onSelectFileClick(e) {
        this.refs.fileInput.click();
    }

    onAvatarScaleChange(e) {
        this.setState({
            avatarScale: parseFloat(e.target.value)
        });
    }

}

CreateAvatarDialog.propTypes = {
    isOpen: React.PropTypes.bool,
    onCancel: React.PropTypes.func.isRequired,
    onFullfill: React.PropTypes.func.isRequired,
    avatarWidth: React.PropTypes.number,
    avatarHeight: React.PropTypes.number,
    uploadUrl: React.PropTypes.string
};

export default CreateAvatarDialog;