import TagsCloudComponent from '../tags-cloud/tags-cloud.vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faGithub} from '@fortawesome/free-brands-svg-icons/faGithub';
import {faLinkedin} from '@fortawesome/free-brands-svg-icons/faLinkedin';
import {faTwitter} from '@fortawesome/free-brands-svg-icons/faTwitter';
import {faFacebook} from '@fortawesome/free-brands-svg-icons/faFacebook';
import {faGooglePlus} from '@fortawesome/free-brands-svg-icons/faGooglePlus';
import {faVk} from '@fortawesome/free-brands-svg-icons/faVk';

import GithubDetailsComponent from '../socials/github.vue';
import TwitterDetailsComponent from '../socials/twitter.vue';

const socials = [
    {
        icon: faGithub,
        url: 'https://github.com/maxnetish',
        label: 'Гитхаб с полезным и безполезным кодом',
        component: GithubDetailsComponent,
        accountId: 'maxnetish'
    },
    {
        icon: faLinkedin,
        url: 'https://ru.linkedin.com/in/maksim-gordeev-8b44a834',
        label: 'Social network and online platform for professionals'
    },
    {
        icon: faTwitter,
        url: 'https://twitter.com/maxnetish',
        label: 'Твиттер, когда не&#769;кому писа&#769;ть',
        component: TwitterDetailsComponent,
        accountId: 'maxnetish'
    },
    {
        icon: faFacebook,
        url: 'https://www.facebook.com/maksim.gordeev',
        label: 'В фейсбук заглядываю иногда'
    }
//    {
//        icon: faGooglePlus,
//        url: 'https://plus.google.com/+MaksimGordeev',
//        label: 'Гуглоплюс на любителя'
//    },
//    {
//        icon: faVk,
//        url: 'https://vk.com/id44057134',
//        label: 'Особо популярно в этой стране'
//    }
];

export default {
    name: "pub-sidebar",
    props: {
        tags: {
            type: Array,
            default: []
        }
    },
    computed: {
        socials() {
            return socials;
        }
    },
    components: {
        'tags-cloud': TagsCloudComponent,
        FontAwesomeIcon
    }
};
