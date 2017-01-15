/**
 * TODO Use select instead
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

class ImageLibraryDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen && !nextProps.isOpen) {
            // reset if dialog closes
        }
    }

    render() {

        return <Modal
            className="jb-create-avatar-dialog"
            width="large"
            isOpen={this.props.isOpen}
            onCancel={this.onCancel.bind(this)}
        >
            <ModalHeader text="Choose image from library" showCloseButton onClose={this.onCancel.bind(this)}/>
            <ModalBody>

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
                    form={formId}
                    disabled={this.state.loading}
                >
                    {this.state.loading ? <Spinner type="inverted"/> : <Glyph icon="cloud-upload"/>}
                    &nbsp;Choose
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

}

ImageLibraryDialog.propTypes = {
    isOpen: React.PropTypes.bool,
    onCancel: React.PropTypes.func.isRequired,
    onFullfill: React.PropTypes.func.isRequired
};

export default ImageLibraryDialog;