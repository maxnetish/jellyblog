var React = require('react');
var Router = require('react-router');
var _ = require('lodash');

var HeadNavItem = require('../head-nav/head-nav-item.jsx');
var JbImage = require('../jb-image/jb-image.jsx');

var FooterComponent = React.createClass({
    mixins: [Router.State],
    getInitialState: function () {
        return {};
    },
    render: function () {
        return <section className="footer-component">
            <div className="row">
                <div className="col-sm-4">
                    <nav className="footer-nav">
                        <ul>
                            {
                                _.chain(this.props.navlinks)
                                    .where({
                                        category: 'footer',
                                        visible: true
                                    })
                                    .map(function (navItem) {
                                        return <HeadNavItem {...navItem} key={navItem.url}/>;
                                    }, this)
                                    .value()
                            }
                        </ul>
                    </nav>
                </div>
                <div className="col-sm-4 text-center">
                    <JbImage className="footer-avatar-image" src={this.props.authorAvatarUrl}/>
                    <div>{this.props.authorDisplayName}</div>
                    <div>{this.props.authorDisplayBio}</div>
                    {
                        this.props.authorTwitterScreenName ?
                            <iframe allowTransparency="true"
                                    frameBorder="0"
                                    scrolling="no"
                                    src={"//platform.twitter.com/widgets/follow_button.html?screen_name="+this.props.authorTwitterScreenName+"&show_count=false&show_screen_name=true&dnt=true"}
                                    style={{height:'20px',width:'132px'}}></iframe> :
                            null
                    }
                </div>
                <div className="col-sm-4">
                    <p className="footer-annotation">{this.props.footerAnnotation}</p>
                </div>
            </div>
        </section>;
    }
});

module.exports = FooterComponent;