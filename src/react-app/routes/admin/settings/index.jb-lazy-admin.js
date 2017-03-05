import React                        from 'react';
import {Link}                       from 'react-router';

import FormInput                    from 'elemental/lib/components/FormInput';
import FormIconField                from 'elemental/lib/components/FormIconField';
import Button                       from 'elemental/lib/components/Button';
import Glyph                        from 'elemental/lib/components/Glyph';
import Card                         from 'elemental/lib/components/Card';
import Form                 from 'elemental/lib/components/Form';
import FormField            from 'elemental/lib/components/FormField';
import FormRow              from 'elemental/lib/components/FormRow';

import {autobind}                   from 'core-decorators';

import {getText}                    from '../../../../i18n';
import {AdminSettingsStore, actions}   from './store';

import modalDialogDecorator         from '../../../../utils/modal-dialog-decorator';
import AdminMediaSrcsetCard         from '../../../components/admin-media-srcset-card';
import UploadFileDialog             from '../../../components/upload-file-dialog';
import {Confirm}                    from '../../../components/common-dialog';

@modalDialogDecorator({modalHookPropKey: 'uploadFileModal', component: UploadFileDialog})
@modalDialogDecorator({modalHookPropKey: 'confirmModal', component: Confirm})
class AdminSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            headerImageSrcset: [],
            headerImageSrcsetLoading: false,
            headerImageSrcsetError: null,
            headerImageSrcsetTag: 'HEADER_IMAGE'
        };
        this.store = new AdminSettingsStore(this.state);
    }

    componentDidMount() {
        this.store.on(AdminSettingsStore.notificationEventKey, this.onStoreUpdate, this);
        actions.componentMounted(this.props);
    }

    componentWillUnmount() {
        this.store.removeListener(AdminSettingsStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('Posts componentWillUpdate: ', nextProps);
    }

    componentWillReceiveProps(nextProps) {

    }

    render() {


        return <div className="settings-wrapper">
            <div className="settings-internal">
                <Card className="_margin-1em _top">
                    <h3>Settings</h3>
                    <hr/>
                    <Form type="horizontal" name="admin-settings-form">
                        <FormRow>
                            <FormField
                                label="Header srcset image"
                            >
                                <Card>
                                    <ol>
                                        {this.state.headerImageSrcset.map((srcsetItem, ind) => <li key={ind}>
                                            <AdminMediaSrcsetCard
                                                onChange={this.onHeaderImageSrcsetChange.bind(this, ind)}
                                                value={srcsetItem}/>
                                            <Button
                                                type="link-delete"
                                                onClick={this.onRemoveHeaderImageSrcsetItemClick.bind(this, ind)}
                                                title="Remove srcset"
                                            >
                                                <Glyph icon="trashcan"/>
                                            </Button>
                                        </li>)}
                                    </ol>
                                </Card>
                                <Button type="primary" onClick={this.onAddHeaderImageSrcsetItemClick}>
                                    <Glyph icon="file-add"/>
                                    <span>Add srcset</span>
                                </Button>
                            </FormField>
                        </FormRow>
                    </Form>
                </Card>
            </div>
            {this.props.children}
        </div>;
    }

    @autobind
    onStoreUpdate(updatedState) {
        this.setState(updatedState);

    }

    @autobind
    onAddHeaderImageSrcsetItemClick(e) {
        this.props.uploadFileModal
            .show({
                uploadMulti: false,
                uploadFieldName: 'srcset',
                uploadAdditionalData: {
                    context: 'media-srcset',
                    srcsetTag: this.state.headerImageSrcsetTag
                }
            })
            .then(uploadedFiles => {
                actions.headerImageSrcsetAddItem({mediaFile: uploadedFiles[0]});
            })
            .catch(err => {
                if (['no', 'cancel'].indexOf(err) !== -1) {
                    return;
                }
                console.warn(err);
            });
    }

    onHeaderImageSrcsetChange(ind, changedProps) {
        actions.headerImageSrcsetItemChange(ind, changedProps);
    }

    onRemoveHeaderImageSrcsetItemClick(ind, e) {
        this.props.confirmModal
            .show({
                text: `Really remove srcset item?`
            })
            .then(() => {
                actions.headerImageSrcsetItemRemove(ind);
            })
    }

}

export default AdminSettings;