import * as PostStatusFilter from './display-post-status';
import * as DateFilter from './display-date-time';

const filterFuncs = {
    [PostStatusFilter.name]: PostStatusFilter.func,
    [DateFilter.name]: DateFilter.func
};

function filter(filterName) {
    return filterFuncs[filterName];
}

export default filter;