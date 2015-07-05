var React = require('react');

var IconSelectDropdownItem = React.createClass({
    render: function () {
        return <div className="navlink-icon-select-item">
            <i className={this.props.item.className}></i>
            <span>{this.props.item.name}</span>
        </div>;
    }
});

module.exports = IconSelectDropdownItem;