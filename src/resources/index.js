import {keyOfprefetchedStatesFromServer} from '../isomorph-utils/shared';
import isBrowser from 'is-in-browser';

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

function fetchDashboardState({routeParams, routeQuery}) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve({
                dashboardState: 'Dashboard after fetch',
                ts: Date.now()
            });
        }, 1500);
    });
}

export {
    fetchAppState,
    fetchDashboardState
}