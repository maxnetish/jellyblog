import clone from 'lodash/clone'

import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

import {debounce, autobind} from 'core-decorators';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        },
        needReloadHeaderImageSrcset: {
            async: false
        },
        headerImageSrcsetReceived: {
            async: false
        },
        resourceError: {
            async: false
        }
    }
});

const headerImageSrcsetTag = 'HEADER_IMAGE';

class AdminSettingsStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {
        actions.needReloadHeaderImageSrcset();
    }

    onNeedReloadHeaderImageSrcset() {
        this.assignState({
            headerImageSrcsetLoading: true
        });
        this.notifyStateChanged();

        resources.mediaSrcset.get({tag: headerImageSrcsetTag})
            .then(actions.headerImageSrcsetReceived)
            .catch(actions.resourceError);
    }

    onHeaderImageSrcsetReceived(response) {
        this.assignState({
            headerImageSrcsetLoading: false,
            headerImageSrcset: clone(response) || [],
            headerImageSrcsetError: null
        });
        this.notifyStateChanged();
    }

    onResourceError(err){
        this.assignState({
            headerImageSrcsetLoading: false,
            headerImageSrcsetError: err
        });
        this.notifyStateChanged();
    }
}

export {
    AdminSettingsStore,
    actions
};