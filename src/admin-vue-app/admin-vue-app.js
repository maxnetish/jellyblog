import Vue from 'vue';
import {default as VuedalsPlugin} from 'vuedals';

Vue.use(VuedalsPlugin);

export default {
    name: 'app',
    data () {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
    }
}