// initial state
function state() {
    return {
        post: {},
        contentMode: 'EDIT',
        tagsFromServer: [],
        tagsJustAdded: [],
        tagsIsLoading: false,
        tagSelectOpen: false,
        titleImagesFromServer: [],
        titleImagesJustAdded: [],
        titleImagesLoading: false,
        titleImageSelectOpen: false,
        statusUpdating: false,
        routesMap: routesMap,
        allowReadOptions: allowReadOptions
    };
}