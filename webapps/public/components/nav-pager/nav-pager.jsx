var React = require('react');
var Router = require('react-router');
var ClassSet = require('classnames');
var Reflux = require('reflux');

var navPagerFlux = require('./nav-pager-flux');

var NavPager = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function(){
        var viewmodel = navPagerFlux.store.getViewModel();
        return {
            previousUrl: viewmodel.previousUrl,
            nextUrl: viewmodel.nextUrl
        };
    },
    render: function () {
        var previousClass = ClassSet({
            'previous': true,
            'disabled': !this.state.previousUrl
        });
        var nextClass = ClassSet({
            'next': true,
            'disabled': !this.state.nextUrl
        });
        if (!this.state.previousUrl && !this.state.nextUrl) {
            return null;
        }
        return <nav>
            <ul className="pager jb-pager">
                <li className={previousClass}>
                    <Router.Link to={this.state.previousUrl || '/'}>
                        <span aria-hidden="true">&larr;</span>
                        <span>&nbsp;Older</span>
                    </Router.Link>
                </li>
                <li className={nextClass}>
                    <Router.Link to={this.state.nextUrl || '/'}>
                        <span>Newer&nbsp;</span>
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
            previousUrl: viewmodel.previousUrl,
            nextUrl: viewmodel.nextUrl
        });
    }
});

module.exports = NavPager;