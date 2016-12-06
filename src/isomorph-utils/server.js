import * as _ from 'lodash';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {match, RouterContext} from 'react-router';
import routes from '../react-app/routes';

import {createElementWithInitialState} from './shared'

function fetchInitialStates(renderProps) {
    let components = renderProps.components;
    let promises = components.map(component => {
        if (component.fetchInitialState) {
            return component.fetchInitialState(renderProps)
                .then(result => {
                    return {
                        state: result,
                        componentName: component.name
                    };
                });
        } else {
            return Promise.resolve({});
        }
    });
    return Promise.all(promises);
}

function buildMarkup(req, renderProps) {
    let lightReq = _.pick(req, ['baseUrl', 'headers', 'host', 'hostname', 'httpVersion', 'ip', 'method', 'path', 'query', 'route', 'originalUrl', 'params', 'user', 'url']);
    let responseText = `<h2>Request was:</h2><pre>${JSON.stringify(lightReq, '', 4)}</pre>`;

    return fetchInitialStates(renderProps)
        .then(initialStates => {
            let reactAppMarkup = renderToString(<RouterContext {...renderProps}
                                                               createElement={createElementWithInitialState(initialStates)}/>);
            let initialStatesSerialized = JSON.stringify(initialStates);
            return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link rel="stylesheet" href="/assets/bundle.css">
                    <link href="//fonts.googleapis.com/css?family=Fira+Sans&subset=latin,cyrillic" rel="stylesheet">
                </head>
                <body>
                    <div id="react-app">${reactAppMarkup}</div>
                    <div>${responseText}</div>
                    <script id="jellyblog-initial-state">
                        window.__jellyblogInitialStates__ = JSON.parse('${initialStatesSerialized}');
                    </script>
                    <script src="/assets/common.js"></script>
                    <script src="/assets/client.js"></script>
                </body>
            </html>`;
        });
}

function expressRouteHandler(req, res) {
    match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if (renderProps) {
            // You can also check renderProps.components or renderProps.routes for
            // your "not found" component or route respectively, and send a 404 as
            // below, if you're using a catch-all route.
            buildMarkup(req, renderProps)
                .then(renderedHtml => {
                    res.status(200).send(renderedHtml);
                });
        } else {
            res.status(404).send('Not found');
        }
    })
}

export {
    buildMarkup,
    expressRouteHandler
}