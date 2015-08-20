var React = require('react');
var Router = require('react-router');
var ClassSet = require('classnames');
var Reflux = require('reflux');
var _ = require('lodash');

var navPagerFlux = require('./nav-pager-flux');

var NavPager = React.createClass({
    mixins: [Reflux.ListenerMixin, Router.State],
    getInitialState: function () {
        var viewmodel = navPagerFlux.store.getViewModel();
        return {
            previous: viewmodel.previous,
            next: viewmodel.next
        };
    },
    render: function () {
        var previousClass = ClassSet({
            'previous': true,
            'disabled': !this.state.next
        });
        var nextClass = ClassSet({
            'next': true,
            'disabled': !this.state.previous
        });
        var activeStates = this.getRoutes();
        var activeStateName = activeStates[activeStates.length - 1].name;
        var activeStateParams = this.getParams();
        var activeStateQuery = this.getQuery();

        //console.log(activeStateName);

        var previousQuery = _.assign(_.clone(activeStateQuery), this.state.previous);
        var nextQuery = _.assign(_.clone(activeStateQuery), this.state.next);

        if (!this.state.previous && !this.state.next) {
            return null;
        }
        return <nav>
            <ul className="pager jb-pager">
                <li className={previousClass}>
                    <Router.Link to={activeStateName || '/'} params={activeStateParams} query={nextQuery}>
                        <span aria-hidden="true">&larr;</span>
                        <span>&nbsp;Newer</span>
                    </Router.Link>
                </li>
                <li className={nextClass}>
                    <Router.Link to={activeStateName || '/'} params={activeStateParams} query={previousQuery}>
                        <span>Older&nbsp;</span>
                        <span aria-hidden="true">&rarr;</span>
                    </Router.Link>
                </li>
            </ul>
        </nav>;
    },
    componentDidMount: function () {
        navPagerFlux.actions.componentMounted();
        this.listenTo(navPagerFlux.store, this.onStoreChanged);
    },
    onStoreChanged: function (viewmodel) {
        this.setState({
            previous: viewmodel.previous,
            next: viewmodel.next
        });
    }
});

module.exports = NavPager;