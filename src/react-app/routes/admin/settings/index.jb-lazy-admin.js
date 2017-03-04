import React                        from 'react';
import {Link}                       from 'react-router';

import FormInput                    from 'elemental/lib/components/FormInput';
import FormIconField                from 'elemental/lib/components/FormIconField';

import {autobind}                   from 'core-decorators';

import {getText}                    from '../../../../i18n';
import {AdminSettingsStore, actions}   from './store';

class AdminSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            headerImageSrcset: [],
            headerImageSrcsetLoading: false,
            headerImageSrcsetError: null
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
                <section>
                    Header image
                </section>
            </div>
        </div>;
    }

    @autobind
    onStoreUpdate(updatedState) {
        this.setState(updatedState);

    }

}

export default AdminSettings;