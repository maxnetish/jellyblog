var React = require('react');
var Router = require('react-router');
var _ = require('lodash');
var ClassSet = require('classnames');

var HeadNavItem = require('./head-nav-item.jsx');

var HeadNav = React.createClass({
    propTypes: {
        navItems: React.PropTypes.array
    },
    getInitialState: function () {
        return {
            menuCollapsed: true
        };
    },
    render: function () {
        var classOfCollapsablePart = ClassSet({
            'collapse': true,
            'navbar-collapse': true,
            'in': !this.state.menuCollapsed
        });
        if (!this.props.navItems || this.props.navItems.length === 0) {
            return null;
        }
        return <nav className="navbar navbar-default jb-head-nav">
            <div className="">
                <div className="">
                    <button type="button" className="navbar-toggle collapsed" onClick={this.onToggleCollapseMenu}>
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>
                <div className={classOfCollapsablePart}>
                    <ul className="nav navbar-nav">
                        {
                            _.chain(this.props.navItems)
                                .where({
                                    category: 'main',
                                    visible: true
                                })
                                .map(function (navItem) {
                                    return <HeadNavItem {...navItem} key={navItem.url}
                                                                     onClick={this.handleCollapseMenu}/>;
                                }, this)
                                .value()
                        }
                    </ul>
                </div>
            </div>
        </nav>;
    },
    onToggleCollapseMenu: function (e) {
        this.setState({
            menuCollapsed: !this.state.menuCollapsed
        });
    },
    handleCollapseMenu: function (e) {
        this.setState({
            menuCollapsed: true
        });
    }
});

module.exports = HeadNav;