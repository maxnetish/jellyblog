function fetchAppState(props) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve({
                appState: 'App after fetch'
            });
        }, 1000);
    });
}

function fetchDashboardState(props) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve({
                dashboardState: 'Dashboard after fetch'
            });
        }, 1500);
    });
}

export {
    fetchAppState,
    fetchDashboardState
}