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
        },
        headerImageSrcsetAddItem: {
            async: true
        },
        headerImageSrcsetItemChange: {
            async: true
        },
        headerImageSrcsetItemRemove: {
            async: true
        }
    }
});

class AdminSettingsStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {
        actions.needReloadHeaderImageSrcset();
    }

    onNeedReloadHeaderImageSrcset() {
        let tag = this.getState().headerImageSrcsetTag;
        this.assignState({
            headerImageSrcsetLoading: true
        });
        this.notifyStateChanged();

        resources.mediaSrcset.get({tag: tag})
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

    onHeaderImageSrcsetAddItem(defaultSrcsetItem){
        let current = this.getState().headerImageSrcset;
        let tag = this.getState().headerImageSrcsetTag;
        let actualSrcsetItem = Object.assign({
            tag: tag,
            mediaFile: null,
            mediaQuery: null,
            visible: true
        }, defaultSrcsetItem);
        current = current || [];
        current.push(actualSrcsetItem);
        this.assignState({
            headerImageSrcset: current
        });
        this.notifyStateChanged();
    }

    onHeaderImageSrcsetItemChange (index, changedProps) {
        let currentState = this.getState();
        let currentSrcsetItem = currentState.headerImageSrcset[index];
        let currentSrcset = currentState.headerImageSrcset;
        let updatedSrcsetItem = Object.assign({}, currentSrcsetItem, changedProps);
        currentSrcset[index] = updatedSrcsetItem;
        this.assignState({
            headerImageSrcset: currentSrcset
        });
        this.notifyStateChanged();
    }

    onHeaderImageSrcsetItemRemove (index) {
        let currentState = this.getState();
        let currentSrcset = currentState.headerImageSrcset;
        currentSrcset.splice(index, 1);
        this.assignState({
            headerImageSrcset: currentSrcset
        });
        this.notifyStateChanged();
    }
}

export {
    AdminSettingsStore,
    actions
};