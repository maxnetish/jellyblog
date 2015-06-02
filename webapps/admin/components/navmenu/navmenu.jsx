var React = require('react/addons');
var Router = require('react-router');
var ClassSet = require('classnames');

var _ = require('lodash');
var definitions = require('./definitions');

var Link = Router.Link;

var Navmenu = React.createClass({
    mixins: [Router.State],

    getInitialState: function(){
       return {
           menuCollapsed: true
       };
    },

    render: function () {
        var navButtons = _.map(definitions, function (def) {
            var liClass = ClassSet({
                'active': this.isActive(def.routeName, this.getParams(), this.getQuery())
            });
            return <li className={liClass} key={def.routeName}>
                <Link to={def.routeName}>
                    <i className={def.icon+' _margin-right-half'}></i>
                    {def.title}
                </Link>
            </li>
        }, this);

        var classOfCollapsablePart = ClassSet({
            'collapse': true,
            'navbar-collapse': true,
            'in': !this.state.menuCollapsed
        });

        var xMarkup = <nav className="navbar navbar-default navbar-admin-upper">
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

    onToggleCollapseMenu: function(e){
        this.setState({
            menuCollapsed: !this.state.menuCollapsed
        });
    }
});

module.exports = Navmenu;