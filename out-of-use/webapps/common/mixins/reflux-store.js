
var FetchInitialStateMixin = {
    setPreloadedData: function(data){
        // select needed from data
        // and set
        // (call in public.jsx on componentWillMount)
    },
    promiseDataToPreload: function(routerState){
        // returns promise
        // that will resolve object like {'store_key': {data}}
        // (call in router/index.js)
    }
};

module.exports = {
    FetchInitialStateMixin: FetchInitialStateMixin
};