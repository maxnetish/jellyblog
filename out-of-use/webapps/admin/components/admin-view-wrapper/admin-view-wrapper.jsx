var React = require('react');

var AdminViewWrapper = React.createClass({
    render: function () {
        return <div className="container-fluid">
            <div className="row">
                <div className="col-lg-offset-2 col-lg-8">
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
});

module.exports = AdminViewWrapper;
