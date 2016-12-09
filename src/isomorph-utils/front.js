import React from 'react';
import {render} from 'react-dom';
import {Router, browserHistory, match} from 'react-router';
import {reactRootElementId, keyOfPrefetchedStatesFromServer} from './shared';

function popInitialStateForComponent(componentName) {
    let result, resultIndex;
    let prefetchedStates;
    if (window.hasOwnProperty(keyOfPrefetchedStatesFromServer)) {
        prefetchedStates = window[keyOfPrefetchedStatesFromServer];
        if (Array.isArray(prefetchedStates)) {
            resultIndex = prefetchedStates.findIndex(s => s.componentName === componentName);
            if (resultIndex > -1) {
                result = prefetchedStates.splice(resultIndex, 1)[0];
            }
        } else {
            console.warn(`window.${keyOfPrefetchedStatesFromServer} should be Array`);
        }
    }
    return result;
}

function createElementWithPrefetchedState(Component, props) {
    let stateForComponent = popInitialStateForComponent(Component.name);
    let initialState = stateForComponent && stateForComponent.state;
    console.info(`Create element ${Component.name} with initial state: `, initialState);
    return <Component {...props} initialState={initialState}/>;
}

function routerRun({routes}) {
    match({history: browserHistory, routes}, (error, redirectLocation, renderProps) => {
        render(<Router {...renderProps}
                       createElement={createElementWithPrefetchedState}
                       onUpdate={() => console.info('Router update: ', arguments)}/>, document.getElementById(reactRootElementId));
    });
}

export {
    routerRun
};