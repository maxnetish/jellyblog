import TagsCloudComponent from '../tags-cloud/tags-cloud.vue';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import faGithub from '@fortawesome/fontawesome-free-brands/faGithub';
import faLinkedin from '@fortawesome/fontawesome-free-brands/faLinkedin';
import faTwitter from '@fortawesome/fontawesome-free-brands/faTwitter';
import faFacebook from '@fortawesome/fontawesome-free-brands/faFacebook';
import faGoogleplus from '@fortawesome/fontawesome-free-brands/faGooglePlus';
import faVk from '@fortawesome/fontawesome-free-brands/faVk';

const socials = [
    {
        icon: faGithub,
        url: 'https://github.com/maxnetish',
        label: 'Гитхаб с полезным и безполезным кодом'
    },
    {
        icon: faLinkedin,
        url: 'https://ru.linkedin.com/in/maksim-gordeev-8b44a834',
        label: 'Social network and online platform for professionals'
    },
    {
        icon: faTwitter,
        url: 'https://twitter.com/maxnetish',
        label: 'Твиттер, когда не&#769;кому писа&#769;ть'
    },
    {
        icon: faFacebook,
        url: 'https://www.facebook.com/maksim.gordeev',
        label: 'В фейсбук заглядываю иногда'
    },
    {
        icon: faGoogleplus,
        url: 'https://plus.google.com/+MaksimGordeev',
        label: 'Гуглоплюс на любителя'
    },
    {
        icon: faVk,
        url: 'https://vk.com/id44057134',
        label: 'Особо популярно в этой стране'
    }
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