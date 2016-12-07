import React from 'react';

function createElementWithInitialState(initialStates) {
    return (Component, props) => {
        let stateForComponent = initialStates.find(s => s.componentName === Component.name);
        let initialState = (stateForComponent && stateForComponent.state) || {};
        return <Component {...props} initialState={initialState}/>;
    };
}

export {
    createElementWithInitialState
};