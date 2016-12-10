function fetchAppState({routeParams, routeQuery}) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve({
                appState: 'App after fetch',
                ts: Date.now()
            });
        }, 1000);
    });
}

export default fetchAppState;