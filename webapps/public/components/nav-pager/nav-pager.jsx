var React = require('react');
var Router = require('react-router');
var ClassSet = require('classnames');

var NavPager = React.createClass({
    getDefaultProps: function () {
        return {
            previousUrl: null,
            nextUrl: null
        }
    },
    render: function () {
        var previousClass = ClassSet({
            'previous': true,
            'disabled': !this.props.previousUrl
        });
        var nextClass = ClassSet({
            'next': true,
            'disabled': !this.props.nextUrl
        });
        if (!this.props.previousUrl && !this.props.nextUrl) {
            return null;
        }
        return <nav>
            <ul className="pager jb-pager">
                <li className={previousClass}>
                    <Router.Link to={this.props.previousUrl || '/'}>
                        <span aria-hidden="true">&larr;</span>
                        <span>&nbsp;Older</span>
                    </Router.Link>
                </li>
                <li className={nextClass}>
                    <Router.Link to={this.props.nextUrl || '/'}>
                        <span>Newer&nbsp;</span>
                        <span aria-hidden="true">&rarr;</span>
                    </Router.Link>
                </li>
            </ul>
        </nav>;
    }
});

module.exports = NavPager;