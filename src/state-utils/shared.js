import isEqual from 'lodash/isEqual';

/**
 *
 * @param prevProps: props
 * @param nextProps: props
 */
function routeParamsChanged({prevProps, nextProps}) {
    return !isEqual(prevProps.params, nextProps.params);
}

/**
 *
 * @param prevProps: props
 * @param nextProps: props
 */
function routeQueryChanged({prevProps, nextProps}) {
    return !isEqual(prevProps.location && prevProps.location.query, nextProps.location && nextProps.location.query);
}

export {
    routeParamsChanged,
    routeQueryChanged
};