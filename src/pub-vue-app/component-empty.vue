<template lang="pug">
    div
        div View "{{viewName}}" is not implemented
</template>
<script>
    export default {
        name: "empty",
        props: {
            viewName: {
                type: String,
                'default': 'Unknown view'
            }
        }
    }
</script>

<style scoped>

</style>