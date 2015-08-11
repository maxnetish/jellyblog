var React = require('react');
var Router = require('react-router');

var JbImage = require('../jb-image/jb-image.jsx');
var HeadNav = require('../head-nav/head-nav.jsx');

var HeaderComponent = React.createClass({
    mixins: [Router.State],
    getInitialState: function () {
        return {};
    },
    render: function () {
        return <section className="header-component">
            <div className="row">
                <div className="col-xs-12">
                    {/*<img className="header-main-image" src={this.props.misc.titleImageUrl}/>*/}
                    <JbImage className="header-main-image" src={this.props.misc.titleImageUrl}/>
                </div>
            </div>

            <div className="row">
                <div className="col-xs-12">
                    <div className="page-header jb-page-header">
                        <h1>
                            <Router.Link to="public-home" className="home-link" title="Home page">
                                {this.props.misc.siteTitle}
                            </Router.Link>
                        </h1>
                    </div>
                </div>
            </div>

            <HeadNav navItems={this.props.navlinks}/>
        </section>;
    }
});

module.exports = HeaderComponent;
