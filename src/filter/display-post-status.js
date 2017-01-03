const name = 'postStatus';

const statuses = {
    'DRAFT': 'Draft',
    'PUB': 'Published'
};
function func(status) {
    return statuses[status] || status;
}
export {
    name,
    func
};