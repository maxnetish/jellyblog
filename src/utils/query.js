import pickBy from 'lodash/pickBy';

function merge({newQuery = {}, oldQuery} = {}) {
    let result = Object.assign({}, oldQuery, newQuery);
    result = pickBy(result, val => !!val);
    return result;
}

export {
    merge
};