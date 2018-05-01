<template lang="pug">
    div
        div._margin-5._bottom
            a._margin-5._right(@click="onLinkClick", v-html="title", href="javascript:void 0")
            font-awesome-icon(:icon="iconSpinner", spin, v-if="loadState==='LOADING'")
        transition(name="github-details-transition")
            div.github-card-ct(v-if="loadState==='LOADED' && showDetails")
                div.github-card-row
                    div.github-card-item.github-card-avatar.avatar
                        a(:href="user.html_url", rel="external noopener", target="_blank")
                            img(:src="user.avatar_url")
                    div.github-card-item.github-card-name-bio
                        div.github-card-name
                            a(:href="user.html_url", rel="external noopener", target="_blank")
                                span.github-card-user-name {{user.name}}
                        div.github-card-bio
                            span.github-card-user-bio {{user.bio}}
                strong {{getText('Recently updated repos')}}
                div.github-card-row.github-card-row-repos
                    div.github-card-item.github-card-repo(v-for="repo in repos")
                        div.github-card-repo-name
                            a(:href="repo.html_url", rel="external noopener", target="_blank")
                                span {{repo.name}}
                        div.github-card-repo-description
                            span {{repo.description}}
                        div.github-card-repo-lang
                            span {{repo.language}}
                        div.github-card-repo-pushed
                            time(:datetime="repo.pushed_at") {{localeDatetime(repo.pushed_at)}}
</template>

<script>
    import resources from 'jb-resources';
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';

    export default {
        name: "github",
        props: {
            title: {
                type: String,
                default: 'Github'
            },
            accountId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                user: null,
                repos: [],
                showDetails: false,
                loadState: 'BEFORE'
            };
        },
        computed: {
            iconSpinner() {
                return faSpinner;
            }
        },
        methods: {
            updateDataFromGithub() {
                let self = this;

                this.loadState = 'LOADING';
                return resources.github.user({accountId: this.accountId})
                    .then(userParsedResponse => {
                        self.user = userParsedResponse;
                        let url = userParsedResponse.repos_url;
                        let query = {
                            page: 1,
                            per_page: 5,
                            type: 'all',
                            sort: 'pushed'
                        };
                        return resources.github.misc({url, query})
                    })
                    .then(reposParsedResonse => {
                        this.loadState = 'LOADED';
                        self.repos = reposParsedResonse;
                        return reposParsedResonse;
                    })
                    .then(null, err => {
                        this.loadState = 'LOADED';
                        console.warn(err);
                    });
            },
            onLinkClick() {
                if (this.loadState === 'LOADING') {
                    return;
                }

                this.showDetails = !this.showDetails;

                if (this.loadState === 'BEFORE') {
                    this.updateDataFromGithub();
                }
            }
        },
        mounted() {
            // this.updateDataFromGithub();
        },
        components: {
            FontAwesomeIcon
        }
    }
</script>

<style scoped lang="less">
    @import "../../../less-pub/main-variables.less";

    .github-card-ct {

        overflow-y: hidden;
        max-height: 800px;

        .github-card-row {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: flex-start;
            align-content: flex-start;

            &.github-card-row-repos {
                flex-wrap: wrap;
                justify-content: flex-start;

                .github-card-item {
                    border: @m_nospa_anchor_text_color solid 1px;
                    padding: 5px;

                    .github-card-repo-lang, .github-card-repo-pushed {
                        font-size: small;
                        font-style: italic;
                    }

                    .github-card-repo-pushed:before {
                        content: 'Updated ';
                    }

                    .github-card-repo-lang:before {
                        content: 'Language: ';
                    }
                }
            }
        }

        .github-card-item {
            align-self: stretch;
            margin: 0 5px 5px 0;
            &.github-card-name-bio {
                width: 100%;
            }
            &:last-child {
                margin-right: 0;
            }
        }

        .github-card-avatar {

            img {
                width: 50px;
            }
        }

        .github-card-name-bio {

        }

    }

    .github-details-transition-enter-active,
    .github-details-transition-leave-active {
        transition: opacity 0.5s ease, max-height 0.5s ease;
    }

    .github-details-transition-enter,
    .github-details-transition-leave-to {
        opacity: 0;
        max-height: 0;
    }
</style>