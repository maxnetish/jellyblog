import React        from 'react';

import {Route, IndexRoute}      from 'react-router';

// import {routeParamsChanged, routeQueryChanged}  from '../../state-utils/shared';

import App          from './app';
import Dashboard    from './app/dashboard';
import About        from './app/about';
import Posts        from './app/posts';
import Post         from './app/post';
import Page404      from './404';
import Login        from './app/login';

function getOnRouteEnterHandler({Component, getUserContext}) {
    return (nextState, replace) => {
        // check rights
        if (Component.requireRoles) {
            // Component.onRouteEnter should be sync - we use it to validate user rights
            // if user not valid we should call something like

            if (nextState.location.pathname === '/login') {
                return;
            }

            let userContext = getUserContext();
            if (Component.requireRoles.indexOf(userContext.role) === -1) {
                replace({
                    pathname: '/login',
                    state: {nextPathname: nextState.location.pathname}
                });
            }
        }
    };
}

function getOnRouteChangeHandler({Component, getUserContext}) {

    return (prevState, nextState, replace) => {
        // check rights
        if (Component.requireRoles) {
            // Component.onRouteEnter should be sync - we use it to validate user rights
            // if user not valid we should call something like

            if (nextState.location.pathname === '/login') {
                return;
            }

            let userContext = getUserContext();
            if (Component.requireRoles.indexOf(userContext.role) === -1) {
                replace({
                    pathname: '/login',
                    state: {nextPathname: nextState.location.pathname}
                });
            }
        }
    };

}

function routes({getUserContext}) {
    return <Route path="/"
                  component={App}
                  onEnter={getOnRouteEnterHandler({Component: App, getUserContext})}
                  onChange={getOnRouteChangeHandler({Component: App, getUserContext})}>
        <IndexRoute component={Dashboard}
                    onEnter={getOnRouteEnterHandler({Component: Dashboard, getUserContext})}/>
        <Route path="about"
               component={About}
               onEnter={getOnRouteEnterHandler({Component: About, getUserContext})}/>

        <Route path="posts"
               component={Posts}
               onEnter={getOnRouteEnterHandler({Component: Posts, getUserContext})}/>
        <Route path="post/:id"
               component={Post}
               onEnter={getOnRouteEnterHandler({Component: Post, getUserContext})}
               onChange={getOnRouteChangeHandler({Component: Post, getUserContext})}/>

        <Route path="login"
               component={Login}
               onEnter={getOnRouteEnterHandler({Component: Post, getUserContext})}/>

        <Route path="*"
               component={Page404}
               onEnter={getOnRouteEnterHandler({Component: Page404, getUserContext})}/>
    </Route>;
}

export default routes;