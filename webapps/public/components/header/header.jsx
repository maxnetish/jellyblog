var React = require('react');
var Router = require('react-router');
var _ = require('lodash');

var JbImage = require('../jb-image/jb-image.jsx');
var HeadNav = require('../head-nav/head-nav.jsx');
var NavPager = require('../nav-pager/nav-pager.jsx');

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
                    <div className="header-main-image-ct">
                        <JbImage className="header-main-image" src={this.props.titleImageUrl}/>
                    </div>
                </div>
            </div>


            <div className="row">
                <div className="col-xs-12">
                    <div className="page-header jb-page-header">
                        <h1>
                            <Router.Link to="public-home" className="home-link" title="Home page">
                                {this.props.siteTitle}
                            </Router.Link>
                        </h1>
                    </div>
                </div>
            </div>

            <HeadNav navItems={this.props.navlinks}/>

            <NavPager />
        </section>;
    }
});

module.exports = HeaderComponent;
