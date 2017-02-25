import React                        from 'react';
import {withRouter, Link}           from 'react-router';

import Row                          from 'elemental/lib/components/Row';
import Col                          from 'elemental/lib/components/Col';
import Button                       from 'elemental/lib/components/Button';
import Glyph                        from 'elemental/lib/components/Glyph';
import FormInput                    from 'elemental/lib/components/FormInput';
import FormIconField                from 'elemental/lib/components/FormIconField';
import Table                          from 'elemental/lib/components/Table';

import {autobind}                   from 'core-decorators';

import {getText}                    from '../../../../i18n';
import {LogStore, actions}          from './store';
import JbPaginationComponent        from '../../../components/pagination';
import {filter as $filter}  from '../../../../filter';

class LogPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logEntries: [],
            searching: false
        };
        this.store = new LogStore(this.state);
    }

    componentDidMount() {
        this.store.on(LogStore.notificationEventKey, this.onStoreUpdate, this);
        actions.componentMounted(this.props);
        actions.needQuery({
            page: this.props.location.query.page
        });
    }

    componentWillUnmount() {
        this.store.removeListener(LogStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    componentWillUpdate(nextProps, nextState) {

    }

    componentWillReceiveProps(nextProps) {
        let oldProps = this.props;
        let oldPage = oldProps.location.query.page;
        let newPage = nextProps.location.query.page;

        if (oldPage !== newPage) {
            // got new query when query url params changed:
            actions.needQuery({
                page: newPage
            });
        }
    }

    render() {
        return <div className="posts-list-wrapper">
            <div className="posts-list-internal">
                <JbPaginationComponent
                    className="_margin-5 _top _bottom"
                    searching={this.state.searching}
                    hasMore={this.state.hasMore}
                />
                <section className="posts-list-items">
                    <Table>
                        <colgroup>
                            <col width="15%"/>
                            <col width=""/>
                            <col width="30%"/>
                            <col width="15%"/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th>{getText('Date')}</th>
                            <th>{getText('Request')}</th>
                            <th>{getText('Remote address')}</th>
                            <th>{getText('Response time')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.logEntries.map(l => <tr>
                            <td>{$filter('dateAndTime')(l.date)}</td>
                            <td>{l.requestMethod} {l.requestUrl}</td>
                            <td>{l.remoteAddress}</td>
                            <td>{l.responseTime}</td>
                        </tr>)}
                        </tbody>
                    </Table>
                </section>
                <JbPaginationComponent
                    className="_margin-5 _top"
                    searching={this.state.searching}
                    hasMore={this.state.hasMore}
                />
            </div>
        </div>;
    }

    @autobind
    onStoreUpdate(updatedState) {
        this.setState(updatedState);
    }
}

export default withRouter(LogPage);