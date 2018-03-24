<template lang="pug">
    div
        div._margin-5._bottom
            a(@click="onLinkClick", v-html="title", href="javascript:void 0")
        div.github-card-ct(v-if="user")
            div.github-card-row
                div.github-card-item.github-card-avatar.avatar
                    a(:href="user.html_url")
                        img(:src="user.avatar_url")
                div.github-card-item.github-card-name-bio
                    div.github-card-name
                        a(:href="user.html_url")
                            span.github-card-user-name {{user.name}}
                    div.github-card-bio
                        span.github-card-user-bio {{user.bio}}
            strong {{'Recently updated repos' | get-text}}
            div.github-card-row.github-card-row-repos
                div.github-card-item.github-card-repo(v-for="repo in repos")
                    div.github-card-repo-name
                        a(:href="repo.html_url")
                            span {{repo.name}}
                    div.github-card-repo-description
                        span {{repo.description}}
                    div.github-card-repo-lang
                        span {{repo.language}}
                    div.github-card-repo-pushed
                        time(:datetime="repo.pushed_at") {{repo.pushed_at | locale-datetime}}
</template>

<script>
    import UrlParse from 'url-parse';

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
                repos: []
            };
        },
        methods: {
            updateDataFromGithub() {
                let self = this;
                console.log(`Update data from github...`);

                fetch(`https://api.github.com/users/${this.accountId}`, {
                    method: 'GET',
                    body: null,
                    headers: {},
                    credentials: 'omit' // or 'same-origin' or 'include'
                })
                    .then(userResponse => userResponse.json())
                    .then(userParsedResponse => {
                        self.user = userParsedResponse;

                        let urlObj = UrlParse(userParsedResponse.repos_url, true);
                        let currentQuery = urlObj.query || {};
                        let newQuery;
                        let nextUri;

                        newQuery = Object.assign(currentQuery, {
                            page: 1,
                            per_page: 5,
                            type: 'all',
                            sort: 'pushed'
                        });
                        nextUri = urlObj.set('query', newQuery).href;

                        return fetch(nextUri, {
                            method: 'GET',
                            body: null,
                            headers: {},
                            credentials: 'omit' // or same-origin or include
                        });
                    })
                    .then(reposResponse => reposResponse.json())
                    .then(reposParsedResonse => {
                        self.repos = reposParsedResonse;
                        return reposParsedResonse;
                    })
                    .then(null, err => {
                        console.warn(err);
                    });

            },
            onLinkClick() {
                this.updateDataFromGithub();
            }
        },
        mounted() {
            // this.updateDataFromGithub();
        }
    }
</script>

<style scoped lang="less">
    @import "../../../less-pub/main-variables.less";

    .github-card-ct {

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
                    /*<!--border: @mssp_anchor_text_color solid 1px;-->*/
                    /*<!--padding: @mssp_base_margin / 2;-->*/
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
</style>