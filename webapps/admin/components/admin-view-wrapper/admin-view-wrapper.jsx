var React = require('react/addons');

var AdminViewWrapper = React.createClass({
    render: function () {
        return <div className="container-fluid">
            <div className="row">
                <div className="col-md-offset-2 col-md-8">
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
});

module.exports = AdminViewWrapper;
