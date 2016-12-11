import React from 'react';
import {renderToString} from 'react-dom/server';
import {match, RouterContext} from 'react-router';
import routes from '../react-app/routes';
import serialize from 'serialize-javascript';

import {reactRootElementId, keyOfPrefetchedStatesFromServer, keyOfUserContext} from './shared'

function pageTemplate({reactAppMarkup, initialStatesSerialized, userContextSerialized}) {
    return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link rel="stylesheet" href="/assets/bundle.css">
                    <link href="//fonts.googleapis.com/css?family=Fira+Sans&subset=latin,cyrillic" rel="stylesheet">
                </head>
                <body>
                    <div id="${reactRootElementId}">${reactAppMarkup}</div>
                    <script id="jellyblog-initial-state">
                        window.${keyOfPrefetchedStatesFromServer} = ${initialStatesSerialized};
                        window.${keyOfUserContext} = ${userContextSerialized};
                    </script>
                    <script src="/assets/common.js"></script>
                    <script src="/assets/client.js"></script>
                </body>
            </html>`;
}

function fetchInitialStates(renderProps) {
    let components = renderProps.components;

    let promises = components.map(component => {
        if (component.fetchInitialState) {
            return component.fetchInitialState({
                routeParams: renderProps.params,
                routeQuery: renderProps.location.query
            })
                .then(result => {
                    return {
                        state: result,
                        componentId: component.componentId
                    };
                });
        } else {
            return Promise.resolve({});
        }
    });
    return Promise.all(promises);
}

function getUserContextFromRequest(req) {
    return () => (req && req.user) || {};
}

function createElementWithInitialState({initialStates, getUserContext}) {
    return (Component, props) => {
        let stateForComponent = initialStates ? initialStates.find(s => s.componentId === Component.componentId) : initialStates;
        let initialState = stateForComponent && stateForComponent.state;
        console.info(`Create element ${Component.name} with initial state: `, initialState);
        return <Component {...props} initialState={initialState} getUserContext={getUserContext}/>;
    };
}

function buildMarkup({req, renderProps, template}) {

    return fetchInitialStates(renderProps)
        .then(initialStates => {
            let reactAppMarkup = renderToString(<RouterContext {...renderProps}
                                                               createElement={createElementWithInitialState({
                                                                   initialStates,
                                                                   getUserContext: getUserContextFromRequest(req)
                                                               })}/>);
            let initialStatesSerialized = serialize(initialStates);
            let userContext = getUserContextFromRequest(req)();
            let userContextSerialized = serialize(userContext);
            return template({reactAppMarkup, initialStatesSerialized, userContextSerialized});
        });
}

function expressRouteHandler(req, res) {
    match({
        routes: routes({getUserContext: getUserContextFromRequest(req)}),
        location: req.url
    }, (error, redirectLocation, renderProps) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if (renderProps) {
            // You can also check renderProps.components or renderProps.routes for
            // your "not found" component or route respectively, and send a 404 as
            // below, if you're using a catch-all route.
            buildMarkup({req, renderProps, template: pageTemplate})
                .then(renderedHtml => {
                    res.status(200).send(renderedHtml);
                })
                .catch(err => console.warn(err));
        } else {
            res.status(404).send('Not found');
        }
    })
}

export {
    buildMarkup,
    expressRouteHandler
}