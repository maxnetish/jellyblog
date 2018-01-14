<template lang="pug">
    #vue-app
        .pub-app-wrapper {{fooText}}
        .pub-app-wrapper {{asyncText}}
</template>

<script>
    export default {
        name: "pub-vue-app",
        data() {
            return {
                fooText: 'Public ssr app here (sync text)'
            }
        },
        computed: {
            asyncText() {
                return this.$store.state.exampleAsyncText;
            }
        },
        asyncData({store, route}) {
            return store.dispatch('fetchData');
        }
    }
</script>

<style scoped>

</style>