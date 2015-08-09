var React = require('react');
var Router = require('react-router');
var ClassSet = require('classnames');
var _ = require('lodash');

var HeadNavItem = React.createClass({
    mixins: [Router.State],
    propTypes: {
        url: React.PropTypes.string,
        newWindow: React.PropTypes.bool,
        icon: React.PropTypes.string,
        text: React.PropTypes.string,
        useClientRouter: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },
    getDefaultProps: function () {
        return {
            onClick: _.noop
        };
    },
    render: function () {
        var target = this.props.newWindow ? '_blank' : null;
        var liClass=ClassSet({
           'disabled-nav-item': this.props.disabled
        });
        var xResult = <li className={liClass}>
            {
                this.props.useClientRouter ?
                    <Router.Link to={this.props.url} target={target} onClick={this.props.onClick}>
                        {this.props.icon ? <i className={this.props.icon}></i> : null}
                        {this.props.text}
                    </Router.Link> :
                    <a href={this.props.url} target={target} onClick={this.props.onClick}>
                        {this.props.icon ? <i className={this.props.icon}></i> : null}
                        {this.props.text}
                    </a>
            }
        </li>;
        return xResult;
    }
});

module.exports = HeadNavItem;