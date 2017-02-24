import React                        from 'react';
import {withRouter, Link}           from 'react-router';

import Row                          from 'elemental/lib/components/Row';
import Col                          from 'elemental/lib/components/Col';
import Button                       from 'elemental/lib/components/Button';
import Glyph                        from 'elemental/lib/components/Glyph';
import FormInput                    from 'elemental/lib/components/FormInput';
import FormIconField                from 'elemental/lib/components/FormIconField';

import {autobind}                   from 'core-decorators';

import PostBrief                    from '../../../components/admin-post-brief';

import {getText}                    from '../../../../i18n';
import resources                    from '../../../../resources';
import {AdminPostsStore, actions}   from './store';

class AdminPosts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            q: props.location.query.q,
            queryFilter: props.location.query.q,
            searching: false
        };
        this.store = new AdminPostsStore(this.state);
    }

    componentDidMount() {
        this.store.on(AdminPostsStore.notificationEventKey, this.onStoreUpdate, this);
        actions.componentMounted(this.props);
        actions.needQuery({
            page: this.props.location.query.page,
            q: this.props.location.query.q
        });
    }

    componentWillUnmount() {
        this.store.removeListener(AdminPostsStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('Posts componentWillUpdate: ', nextProps);
    }

    componentWillReceiveProps(nextProps) {
        let oldProps = this.props;
        let oldQ = oldProps.location.query.q;
        let oldPage = oldProps.location.query.page;
        let newQ = nextProps.location.query.q;
        let newPage = nextProps.location.query.page;

        if (oldQ !== newQ || oldPage !== newPage) {
            // got new query when query url params changed:
            actions.needQuery({
                page: newPage,
                q: newQ
            });
        }
    }

    render() {
        let currentQuery = this.props.location.query;
        let currentPage = parseInt(currentQuery.page, 10) || 1;
        let leftPaginationVisible = currentPage > 1;
        let rightPaginationVisible = this.state.hasMore;
        let leftPage = currentPage - 1;
        leftPage = leftPage === 1 ? undefined : leftPage;
        let rightPage = currentPage + 1;
        let currentPathname = this.props.location.pathname;

        let paginationRow = <div className="posts-list-pagination-ct">
            {leftPaginationVisible ?
                <Button
                    className="posts-list-pagination-button"
                    type="hollow-primary"
                    component={<Link
                        to={{pathname: currentPathname, query: Object.assign({}, currentQuery, {page: leftPage})}}/>}
                    disabled={this.state.searching}
                >
                    <Glyph icon="chevron-left"/>
                    <span className="posts-list-pagination-button-text">{getText('Here')}</span>
                </Button> : null}
            {rightPaginationVisible ?
                <Button
                    className="posts-list-pagination-button right"
                    type="hollow-primary"
                    component={<Link
                        to={{pathname: currentPathname, query: Object.assign({}, currentQuery, {page: rightPage})}}/>}
                    disabled={this.state.searching}
                >
                    <span className="posts-list-pagination-button-text">{getText('There')}</span>
                    <Glyph icon="chevron-right"/>
                </Button> : null}
        </div>;

        return <div className="posts-list-wrapper">
            <div className="posts-list-internal">
                <section className="posts-list-filter _margin-5 _top">
                    <FormIconField iconPosition="right"
                                   iconKey="search"
                                   iconColor="primary"
                                   iconIsLoading={this.state.searching}
                    >
                        <FormInput type="text"
                                   placeholder={getText('Enter 3 or more chars to find')}
                                   name="q"
                                   value={this.state.q || ''}
                                   id="q"
                                   onChange={this.onQChanged}
                        />
                    </FormIconField>
                </section>
                {paginationRow}
                <section className="posts-list-items">
                    {this.state.posts.map(p => <PostBrief key={p._id} post={p}/>)}
                </section>
                {paginationRow}
            </div>
        </div>;
    }

    @autobind
    onStoreUpdate(updatedState) {
        this.setState(updatedState);

        // update url when query should be changed
        let pageFromQuery = parseInt(this.props.location.query.page, 10) || 1;

        if (updatedState.queryFilter !== this.props.location.query.q) {
            console.log('QUERY: ', updatedState.queryFilter);
            this.props.router.push({
                pathname: this.props.location.pathname,
                query: Object.assign({}, this.props.location.query, {
                    q: updatedState.queryFilter || undefined,
                    page: undefined
                })
            });
        }
    }

    @autobind
    onCreateNewClick(e) {
        resources.post.create()
            .then(response => console.info(response));
    }

    @autobind
    onQChanged(e) {
        actions.queryFilterTextChanged(e.target.value);
        // this.props.router.replace({
        //     pathname: this.props.location.pathname,
        //     query: Object.assign({}, this.props.location.query, {q: e.target.value})
        // });
    }
}

export default withRouter(AdminPosts);