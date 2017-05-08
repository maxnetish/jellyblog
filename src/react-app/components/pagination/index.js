import React                        from 'react';
import {withRouter, Link}           from 'react-router';

import Button                       from 'elemental/lib/components/Button';
import Glyph                        from 'elemental/lib/components/Glyph';

import {getText}                    from '../../../i18n';

/**
 * adds parameter 'page' to url query
 *
 * props: {
 *      hasMore,
 *      searching,
 *      className
 * }
 * @param props
 * @returns {XML}
 * @constructor
 */
function JbPaginationComponent(props) {
    let currentQuery = props.location.query;
    let currentPage = parseInt(currentQuery.page, 10) || 1;
    let leftPaginationVisible = currentPage > 1;
    let rightPaginationVisible = props.hasMore;
    let leftPage = currentPage - 1;
    leftPage = leftPage === 1 ? undefined : leftPage;
    let rightPage = currentPage + 1;
    let currentPathname = props.location.pathname;

    let rootClassName = `jb-pagination-ct ${props.className}`;

    let paginationRow = <div className={rootClassName}>
        {leftPaginationVisible ?
            <Button
                className="jb-pagination-button"
                type="hollow-primary"
                component={<Link
                    to={{pathname: currentPathname, query: Object.assign({}, currentQuery, {page: leftPage})}}/>}
                disabled={props.searching}
            >
                <Glyph icon="chevron-left"/>
                <span className="jb-pagination-button-text">{getText('Here')}</span>
            </Button> : null}
        {rightPaginationVisible ?
            <Button
                className="jb-pagination-button right"
                type="hollow-primary"
                component={<Link
                    to={{pathname: currentPathname, query: Object.assign({}, currentQuery, {page: rightPage})}}/>}
                disabled={props.searching}
            >
                <span className="jb-pagination-button-text">{getText('There')}</span>
                <Glyph icon="chevron-right"/>
            </Button> : null}
    </div>;

    return paginationRow;
}

export default withRouter(JbPaginationComponent);