import React from 'react';

import {Link} from 'react-router';

function LinkBar() {
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

export default LinkBar;