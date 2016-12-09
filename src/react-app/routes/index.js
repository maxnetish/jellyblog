import React        from 'react';

import {Route, IndexRoute}      from 'react-router';

// import {routeParamsChanged, routeQueryChanged}  from '../../state-utils/shared';

import App          from './app';
import Dashboard    from './app/dashboard';
import About        from './app/about';
import Posts        from './app/posts';
import Post         from './app/post';
import Page404      from './404';

const routes = <Route path="/" component={App}>
    <IndexRoute component={Dashboard}/>
    <Route path="about" component={About}/>

    <Route path="posts" component={Posts}/>
    <Route path="post/:id" component={Post}/>

    <Route path="*" component={Page404}/>
</Route>;

export default routes;