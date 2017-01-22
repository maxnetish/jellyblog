import React from 'react';

import {autobind} from 'core-decorators';

import Modal from 'elemental/lib/components/Modal';
import ModalBody from 'elemental/lib/components/ModalBody';
import ModalHeader from 'elemental/lib/components/ModalHeader';
import ModalFooter from 'elemental/lib/components/ModalFooter';
import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Alert from 'elemental/lib/components/Alert';

class ConfirmDialog extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    render() {

        return <Modal
            width="small"
            isOpen={this.props.isOpen}
            onCancel={this.onCancel}
        >
            <ModalHeader text={this.props.title} showCloseButton onClose={this.onCancel}/>
            <ModalBody>
                <Alert type="info">
                    {this.props.text}
                </Alert>
            </ModalBody>
            <ModalFooter>
                <Button
                    type="link-cancel"
                    onClick={this.onNoClick}
                >
                    <Glyph icon="circle-slash"/>
                    <span>{this.props.noLabel}</span>
                </Button>
                <Button
                    type="primary"
                    onClick={this.onYesClick}
                >
                    {this.props.yesLabel}
                </Button>
            </ModalFooter>
        </Modal>;
    }

    @autobind
    onCancel(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        this.props.onReject('cancel');
    }

    @autobind
    onNoClick(e){
        this.props.onReject('no');
    }

    @autobind
    onYesClick(e) {
        this.props.onResolve('yes');
    }
}

ConfirmDialog.propTypes = {
    // Use from decorator:
    isOpen: React.PropTypes.bool,                   // Modal visible
    onResolve: React.PropTypes.func,                // On cancel modal handler
    onReject: React.PropTypes.func,                 // On resolve dialog handler

    // Use in .show(data)
    title: React.PropTypes.string,
    text: React.PropTypes.string,
    noLabel: React.PropTypes.string,
    yesLabel: React.PropTypes.string
};
ConfirmDialog.defaultProps = {
    title: 'Confirm',
    text: 'Warning! Really do dangerous action?',
    noLabel: 'No',
    yesLabel: 'Yes'
};

export default ConfirmDialog;