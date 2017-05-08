var React = require('react');
var Router = require('react-router');
var ClassSet = require('classnames');
var _ = require('lodash');

var NavPager = React.createClass({
    mixins: [Router.State],
    propTypes: {
        next: React.PropTypes.object,
        previous: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            next: null,
            previous: null
        };
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        var previousClass = ClassSet({
            'previous': true,
            'disabled': !this.props.next
        });
        var nextClass = ClassSet({
            'next': true,
            'disabled': !this.props.previous
        });
        var activeStates = this.getRoutes();
        var activeStateName = activeStates[activeStates.length - 1].name;
        var activeStateParams = this.getParams();
        var activeStateQuery = this.getQuery();

        //console.log(activeStateName);

        var previousQuery = _.assign(_.clone(activeStateQuery), this.props.previous);
        var nextQuery = _.assign(_.clone(activeStateQuery), this.props.next);

        if (nextQuery.skip === 0) {
            delete nextQuery.skip;
        }

        if (!this.props.previous && !this.props.next) {
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
    }
});

module.exports = NavPager;