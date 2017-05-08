function fetchDashboardState({routeParams, routeQuery}) {
    // when RPC call this.xhr will be true & this.req will be filled
    // but direct call hasn't context
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve({
                dashboardState: 'Dashboard after fetch',
                ts: Date.now()
            });
        }, 1500);
    });
}

export default fetchDashboardState;