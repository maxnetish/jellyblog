import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory, match} from 'react-router'
import routes from './react-app/routes';

import {fetchInitialStates} from './isomorph-utils/front';
import {createElementWithInitialState} from './isomorph-utils/shared';

match({
    history: browserHistory,
    routes
}, (error, redirectLocation, renderProps) => {
    console.info('renderProps: ', renderProps);

    // Протолкнуть initialStates

    let initialStates = fetchInitialStates(renderProps);

    render(<Router {...renderProps}
                   createElement={createElementWithInitialState(initialStates)}/>, document.getElementById('react-app'));
});
