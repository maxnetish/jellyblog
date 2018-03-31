import routesMap from '../../../../config/routes-map.json';
import DialogConfirmMixin from '../../components/dialog-confirm/mixin';
import DialogAlertMixin from '../../components/dialog-alert/mixin';
import {getText} from '../../filters';
import {mapState, mapGetters, mapMutations} from 'vuex';
import {store as moduleStore, mutationTypes} from './store';
import {getDefaultFiller} from "../../../utils/async-store-filler";

const storeNamespace = 'options';

function mapStoreNamespace(n) {
    return [storeNamespace, n].join('/');
}

export default {
    name: 'options',
    mixins: [DialogConfirmMixin, DialogAlertMixin],
    data() {
        return {};
    },
    computed: {
        ...mapState(storeNamespace, [
            'robotsTxt',
            'robotsTxtLoading',
            'uploading',
            'restoreResults',
            'errorState'
        ]),
        ...mapGetters(storeNamespace, [
            'robotsTxtDirty'
        ]),
        downloadDumpUrl() {
            return routesMap.dbDump;
        }
    },
    methods: {
        ...mapMutations(storeNamespace, {
            onRobotsTxtContentInput: mutationTypes.ROBOTS_CONTENT_CHANGED
        }),
        restoreDbuploadClick(e) {
            this.$refs.restoreDbuploadFileInput.click();
        },
        restoreDbuploadFileInputChanged(e) {
            let file = e.target.files[0];
            let self = this;

            this.showConfirm({
                message: getText('Restore database from dump file?'),
                title: getText('Restore')
            })
                .then(() => {
                    return self.$store.dispatch(mapStoreNamespace('uploadDumpFileToRestore'), {file});
                })
                .then(null, err => {
                    if (err === 'NO') {
                        return;
                    }
                    this.showAlert(err);
                });
        },
        onSubmitRobotsTxt(e) {
            return this.$store.dispatch(mapStoreNamespace('robotsTxtSubmit'));
        },
        onErrorStateChanged(newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // clear error in state after dialog dismiss
            this.showAlert(newVal)
                .then(() => this.$store.commit(mapStoreNamespace(mutationTypes.ERROR), null));
        }
    },
    watch: {
        'errorState': 'onErrorStateChanged'
    },
    destroyed() {
        this.$store.unregisterModule(storeNamespace);
    },
    asyncData({store, route, beforeRouteUpdateHook = false}) {
        return getDefaultFiller({
            moduleStore,
            storeNamespace,
            storeActionName: 'fetchPageData'
        })({
            store,
            route,
            beforeRouteUpdateHook
        });
    }
};