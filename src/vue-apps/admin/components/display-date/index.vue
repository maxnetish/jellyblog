<template lang="pug">
    time.date(:datetime="value | dateAsIsoString") {{value | dateAsLocaleString}}
</template>
<script>
    const lang = document.getElementsByTagName('html')[0].lang || 'en';

    function normalizeValue(dateOrString) {
        if (typeof dateOrString === 'string') {
            return new Date(dateOrString);
        } else if (dateOrString instanceof Date) {
            return dateOrString;
        }
        return null;
    }

    export default {
        name: 'display-date',
        props: ['value'],
        filters: {
            dateAsIsoString: function (value) {
                let dt = normalizeValue(value);
                return dt ? dt.toISOString() : null;
            },
            dateAsLocaleString: function (value) {
                let dt = normalizeValue(value);
                return dt ? dt.toLocaleDateString(lang) : null;
            }
        }
    };
</script>
<style lang="less">

</style>