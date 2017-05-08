var React = require('react');
var ReactRouter = require('react-router');
var ClassSet = require('classnames');

var _ = require('lodash');
var definitions = require('./definitions');

var Link = ReactRouter.Link;

var Navmenu = React.createClass({
    mixins: [ReactRouter.History],

    getInitialState: function () {
        return {
            menuCollapsed: true
        };
    },

    render: function () {
        var navButtons = _.map(definitions, function (def) {
            var liClass = ClassSet({
                'active': def.routePath && this.history.isActive(def.routePath, def.routeQuery, true)
            });
            var key = def.routePath || def.url;
            return <li className={liClass} key={key}>
                {
                    def.routePath ?
                        <Link to={def.routePath} target={def.target} onClick={this.handleCollapseMenu}>
                            <i className={def.icon+' _margin-right-half'}></i>
                            {def.title}
                        </Link> :
                        <a href={def.url} target={def.target} onClick={this.handleCollapseMenu}>
                            <i className={def.icon+' _margin-right-half'}></i>
                            {def.title}
                        </a>
                }
            </li>
        }, this);

        var classOfCollapsablePart = ClassSet({
            'collapse': true,
            'navbar-collapse': true,
            'in': !this.state.menuCollapsed
        });

        var xMarkup = <nav className="navbar navbar-default navbar-fixed-top navbar-admin-upper">
            <div className="container-fluid">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" onClick={this.onToggleCollapseMenu}>
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" to="admin-home"><i className="glyphicon glyphicon-home"></i></Link>
                </div>
                <div className={classOfCollapsablePart}>
                    <ul className="nav navbar-nav">
                        {navButtons}
                    </ul>
                </div>
            </div>
        </nav>;

        return xMarkup;
    },

    onToggleCollapseMenu: function (e) {
        this.setState({
            menuCollapsed: !this.state.menuCollapsed
        });
    },
    handleCollapseMenu: function(e){
        this.setState({
            menuCollapsed: true
        });
    }
});

module.exports = Navmenu;
