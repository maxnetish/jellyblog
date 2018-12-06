<template lang="pug" src="./tags-cloud.pug"></template>
<script>
    export default {
        name: "tags-cloud",
        data() {
            return {};
        },
        props: {
            tags: {
                type: Array,
                default: []
            }
        },
        methods: {
            getClassForTag(tagInfo) {
                let className = 'level-' + tagInfo.relativeCount;
                return {
                    [className]: true
                };
            }
        }
    }
</script>

<style scoped></style>