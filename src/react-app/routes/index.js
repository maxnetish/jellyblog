import React from 'react';
import {Route, Link, IndexRoute, Redirect} from 'react-router';

import * as resources from '../../resources';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = props.initialState || {};
    }

    componentDidMount() {

    }

    render() {
        return <div>
            <LinkBar/>
            <h2>App component</h2>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>App state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
            {this.props.children}
        </div>;
    }

    static fetchInitialState(renderProps) {
        return resources.fetchAppState(renderProps);
    }
}

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = props.initialState || {};
    }

    componentDidMount() {

    }

    render() {
        return <div>
            <h3>Dashboard component</h3>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
            <div>Dashboard state:</div>
            <pre>{JSON.stringify(this.state, '', 4)}</pre>
        </div>;
    }

    static fetchInitialState(renderProps) {
        return resources.fetchDashboardState(renderProps);
    }
}

function About(props) {
    return <div>
        <h3>About component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

function Posts(props) {
    return <div>
        <h3>Posts component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

function Post(props) {
    return <div>
        <h3>Post component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

function Page404(props) {
    return <div>
        <h3>404: not found</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

function LinkBar(props) {
    return <nav role="menu">
        <ul>
            <li>
                <Link to="/" activeClassName="active-link" onlyActiveOnIndex={true}>Root</Link>
            </li>
            <li>
                <Link to="/about" activeClassName="active-link">About</Link>
            </li>
            <li>
                <Link to="/posts" activeClassName="active-link">Posts</Link>
            </li>
            <li>
                <Link to="/post/123" activeClassName="active-link">Posts -> 123</Link>
            </li>
            <li>
                <Link to="/non-existent/path" activeClassName="active-link">No path</Link>
            </li>
        </ul>
    </nav>;
}

const routes = <Route path="/" component={App}>
    <IndexRoute component={Dashboard}/>
    <Route path="about" component={About} fooProp={{foo: 'bar'}}/>

    <Route path="posts" component={Posts}/>
    <Route path="post/:id" component={Post}/>

    <Route path="*" component={Page404}/>
</Route>;

export default routes;