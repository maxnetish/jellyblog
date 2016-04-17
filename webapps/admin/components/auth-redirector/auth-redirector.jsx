var React = require('react');

var AuthRedirector = React.createClass({
    render: function () {
        return <section>
            <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 text-center">
                    <a href="/auth/google" className="btn btn-lg btn-primary">
                        <i className="btn-icon glyphicon glyphicon-log-in"></i>
                        <span className="btn-text">Login with Google account</span>
                    </a>
                </div>
            </div>
            </div>
        </section>;
    }
});

module.exports = AuthRedirector;