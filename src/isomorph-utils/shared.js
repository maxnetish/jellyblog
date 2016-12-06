import React from 'react';
import find from 'lodash/find'

function createElementWithInitialState(initialStates) {
    return (Component, props) => {
        let stateForComponent = find(initialStates, s => s.componentName === Component.name);
        let initialState = (stateForComponent && stateForComponent.state) || {};
        return <Component {...props} initialState={initialState}/>;
    };
}

export {
    createElementWithInitialState
};