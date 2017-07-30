import Vue from 'vue';
import {default as VuedalsPlugin, Component as VuedalComponent} from 'vuedals';
import 'vue-strap/dist/vue-strap-lang.js';
import routesMap from '../../config/routes-map.json';

Vue.use(VuedalsPlugin);

export default {
    name: 'app',
    data () {
        return {
            msg: 'Welcome to Your Vue.js App',
            logoutUrl: routesMap.logout
        }
    },
    components: {
        'vuedals': VuedalComponent
    }
}