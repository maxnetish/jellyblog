<template lang="pug">
    span.post-status-label(:class="{'bg-danger': value==='PUB', 'bg-info': value==='DRAFT'}") {{value | get-text}}
</template>
<script>
    export default {
        name: 'post-status',
        props: ['value']
    };
</script>
<style lang="less">
    .post-status-label {
        padding: 0.25em 1em;
        border-radius: 0.25em;
    }
</style>