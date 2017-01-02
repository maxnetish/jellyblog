import React from 'react';
import {render} from 'react-dom';
import {Router, browserHistory, match} from 'react-router';
import {reactRootElementId, keyOfPrefetchedStatesFromServer, keyOfUserContext} from './shared';
import ClientUserContext from '../passport/client';

function popInitialStateForComponent(componentId) {
    let result, resultIndex;
    let prefetchedStates;
    if (window.hasOwnProperty(keyOfPrefetchedStatesFromServer)) {
        prefetchedStates = window[keyOfPrefetchedStatesFromServer];
        if (Array.isArray(prefetchedStates)) {
            resultIndex = prefetchedStates.findIndex(s => s.componentId === componentId);
            if (resultIndex > -1) {
                result = prefetchedStates.splice(resultIndex, 1)[0];
            }
        } else {
            console.warn(`window.${keyOfPrefetchedStatesFromServer} should be Array`);
        }
    }
    return result;
}

function getUserContext() {
    return ClientUserContext;
}

function createElementWithPrefetchedState(Component, props) {
    let stateForComponent = popInitialStateForComponent(Component.componentId);
    let initialState = stateForComponent && stateForComponent.state;
    // console.info(`Create element ${Component.componentId} with initial state: `, initialState);
    return <Component {...props} initialState={initialState} getUserContext={getUserContext}/>;
}

function routerRun({routes}) {
    match({
        history: browserHistory,
        routes: routes({getUserContext: getUserContext})
    }, (error, redirectLocation, renderProps) => {
        render(<Router {...renderProps}
                       createElement={createElementWithPrefetchedState}
                       onUpdate={() => console.info('Router update: ', arguments)}/>, document.getElementById(reactRootElementId));
    });
}

export {
    routerRun
};