import React        from 'react';
import isBrowser from 'is-in-browser';

import moment       from 'moment';
import 'moment/locale/ru';

import {locale}     from '../../i18n';
import {setLocale as setFilterLocale}  from '../../filter';

import {Route, IndexRoute, IndexRedirect}      from 'react-router';

// import {routeParamsChanged, routeQueryChanged}  from '../../state-utils/shared';

import PubApp       from './p/index.jb-lazy-pub';
import Dashboard    from './p/dashboard/index.jb-lazy-pub';
import About        from './p/about.jb-lazy-pub';
import Posts        from './p/posts.jb-lazy-pub';
import Post         from './p/post.jb-lazy-pub';

import Page404      from './404';

import AdminApp     from './admin/index.jb-lazy-admin';
import AdminPosts   from './admin/posts/index.jb-lazy-admin';
import AdminPost    from './admin/edit/index.jb-lazy-admin';
import LogPage      from './admin/log/index.jb-lazy-admin';
import AdminSettingsPage    from './admin/settings/index.jb-lazy-admin';

import UserBadge    from '../components/user-badge';

function loadComponent(moduleOrComponent) {
    if (isBrowser) {
        return lazyLoadModule(moduleOrComponent);
    }
    return syncLoadComponent(moduleOrComponent);
}

function syncLoadComponent(syncComponent) {
    return (location, cb) => cb(null, syncComponent);
}

function lazyLoadModule(lazyModule) {
    return (location, cb) => {
        lazyModule(module => {
            cb(null, module.default)
        })
    };
}

function getOnRouteEnterHandler({Component, getUserContext}) {
    return (nextState, replace) => {
        // check rights
        if (Component.requireRoles) {
            // Component.onRouteEnter should be sync - we use it to validate user rights
            // if user not valid we should call something like

            if (nextState.location.pathname === '/401') {
                return;
            }

            let userContext = getUserContext();
            if (Component.requireRoles.indexOf(userContext.role) === -1) {
                replace({
                    pathname: '/401',
                    query: {next: nextState.location.pathname + nextState.location.search}
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
            // [changes

            if (nextState.location.pathname === '/401') {
                return;
            }

            let userContext = getUserContext();
            if (Component.requireRoles.indexOf(userContext.role) === -1) {
                replace({
                    pathname: '/401',
                    query: {next: nextState.location.pathname + nextState.location.search}
                });
            }
        }
    };
}

function RootComponent(props) {
    // Here we should init localization from props.getUserLanguage()
    moment.locale(props.getUserLanguage());
    locale(props.getUserLanguage());
    setFilterLocale(props.getUserLanguage());
    // console.log(`moment now: ${moment.locale()}`);
    // console.log(`locale() now: ${locale()}`);
    return <div>
        {props.children}
        <div className="root-footer">
            <div className="root-footer-item">
                <UserBadge user={props.getUserContext()}/>
            </div>
            <div className="root-footer-item">
                <div className="image-react-logo"></div>
            </div>
            <div className="root-footer-item">
                <div className="image-babel-logo"></div>
            </div>
        </div>
    </div>;
}

function UnderConstructionComponent(props) {
    return <div>
        <h4>Under construction now</h4>
    </div>;
}

function NotAuthorizeComponent(props) {
    return <div>
        <h4>Not permitted</h4>
        <p>You should login with eligible credentials</p>
    </div>;
}

function routes({getUserContext}) {

    return <Route path="/"
                  component={RootComponent}>
        <IndexRedirect to="/p"/>
        <Route path="p"
               getComponent={loadComponent(PubApp)}
               onEnter={getOnRouteEnterHandler({Component: PubApp, getUserContext})}
               onChange={getOnRouteChangeHandler({Component: PubApp, getUserContext})}>
            <IndexRoute getComponent={loadComponent(Dashboard)}
                        onEnter={getOnRouteEnterHandler({Component: Dashboard, getUserContext})}/>
            <Route path="about"
                   getComponent={loadComponent(About)}
                   onEnter={getOnRouteEnterHandler({Component: About, getUserContext})}/>
            <Route path="posts"
                   getComponent={loadComponent(Posts)}
                   onEnter={getOnRouteEnterHandler({Component: Posts, getUserContext})}/>
            <Route path="post/:id"
                   getComponent={loadComponent(Post)}
                   onEnter={getOnRouteEnterHandler({Component: Post, getUserContext})}
                   onChange={getOnRouteChangeHandler({Component: Post, getUserContext})}/>
        </Route>
        <Route path="401"
               component={NotAuthorizeComponent}/>
        <Route path="admin"
               getComponent={loadComponent(AdminApp)}
               onEnter={getOnRouteEnterHandler({Component: AdminApp, getUserContext})}
               onChange={getOnRouteChangeHandler({Component: AdminApp, getUserContext})}>
            <IndexRoute component={UnderConstructionComponent}/>
            <Route path="settings"
                   getComponent={loadComponent(AdminSettingsPage)}/>
            <Route path="posts"
                   getComponent={loadComponent(AdminPosts)}/>
            <Route path="edit/:postId"
                   getComponent={loadComponent(AdminPost)}/>
            <Route path="log"
                   getComponent={loadComponent(LogPage)}/>
        </Route>
        <Route path="*"
               getComponent={loadComponent(Page404)}
               onEnter={getOnRouteEnterHandler({Component: Page404, getUserContext})}/>
    </Route>;
}

export default routes;