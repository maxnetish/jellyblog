<template lang="pug">
    div
        div._margin-5._bottom
            a._margin-5._right(@click="onLinkClick", v-html="title", href="javascript:void 0")
        div(v-if="showDetails")
            a.twitter-timeline(:href="twitterLinkUrl", data-tweet-limit="4", data-chrome="transparent", data-link-color="#ff7f50") Tweets by {{accountId}}
</template>

<script>
    /**
     * See https://dev.twitter.com/web/embedded-tweets
     */
    import isBrowser from 'is-in-browser';

    export default {
        name: "twitter",
        props: {
            title: {
                type: String,
                default: 'Twitter'
            },
            accountId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                showDetails: false
            };
        },
        computed: {
            twitterLinkUrl() {
                return `https://twitter.com/${this.accountId}?ref_src=twsrc%5Etfw`;
            }
        },
        methods: {
            onLinkClick() {
                this.initTwiiterLib();
                this.showDetails = !this.showDetails;

                this.$nextTick(() => {
                    if (this.showDetails && window.twttr && window.twttr.widgets && window.twttr.widgets.load) {
                        // to make twitter script to see new twitter link
                        window.twttr.widgets.load();
                    }
                });
            },
            initTwiiterLib() {

                if (!isBrowser) {
                    return;
                }

                window.twttr = (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0],
                        t = window.twttr || {};
                    if (d.getElementById(id)) return t;
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "https://platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);

                    t._e = [];
                    t.ready = function (f) {
                        t._e.push(f);
                    };
                    return t;
                }(document, "script", "twitter-wjs"));
            }
        }
    }
</script>

<style scoped>

</style>