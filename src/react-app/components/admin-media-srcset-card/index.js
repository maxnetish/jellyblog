import React                from 'react';
import moment               from 'moment';

import Button               from 'elemental/lib/components/Button';
import Glyph                from 'elemental/lib/components/Glyph';
import Form                 from 'elemental/lib/components/Form';
import FormField            from 'elemental/lib/components/FormField';
import FormInput            from 'elemental/lib/components/FormInput';
import FormRow              from 'elemental/lib/components/FormRow';
import Radio                from 'elemental/lib/components/Radio';
import Row                  from 'elemental/lib/components/Row';
import Col                  from 'elemental/lib/components/Col';
import Card                 from 'elemental/lib/components/Card';

import Select               from 'react-select';
import DatePicker           from 'react-datepicker';

import AttachmentLink       from '../attachment-link';

import classnames           from 'classnames';
import {autobind}           from 'core-decorators';
import modalDialogDecorator from '../../../utils/modal-dialog-decorator';

import fileStoreConfig      from '../../../../config/file-store.json';
import {filter as $filter}  from '../../../filter';
import {getText}            from '../../../i18n';

export default class MediaSrcsetCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let mediaSrcset = this.props.value;
        let fileInfo = mediaSrcset.mediaFile;

        let fileInfoPart;
        if(fileInfo){
            fileInfoPart = <div>
                <AttachmentLink attachment={fileInfo}/>
                &nbsp;({fileInfo.length} bytes; {fileInfo.contentType})
            </div>;
        } else {
            fileInfoPart = <div>
                <span className="_margin-1em _right">
                    <b>No attached file</b>
                </span>
            </div>;
        }

        return <div>
            {fileInfoPart}
            {this.props.children}
        </div>;

    }

    @autobind
    onInputChanged(e) {
        this.props.onChange({
            [e.target.name]: e.target.value
        });
    }

    @autobind
    onAddAttachmentsClick(e) {
        let self = this;
        this.props.uploadFileModal
            .show({
                uploadMulti: false,
                uploadFieldName: 'srcset',
                uploadAdditionalData: {
                    context: 'media-srcset',
                    srcsetTag: this.props.value.tag
                }
            })
            .then(uploadedFiles => {
                self.props.onChange({
                    mediaFile: uploadedFiles[0]
                });
            })
            .catch(err => {
                if (['no', 'cancel'].indexOf(err) !== -1) {
                    return;
                }
                console.warn(err);
            });
    }
}

MediaSrcsetCard.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
};

MediaSrcsetCard.defaultProps = {
    value: {}
};