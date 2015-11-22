var React = require('react');
// var _ = require('lodash');

var HeaderComponent = require('../components/header/header.jsx');


var Layout = React.createClass({
    render: function render() {
        var styleSheetHref = this.props.developmentMode
            ? '/css/app.css'
            : '/css/app.min.css';
        var scriptSrc = this.props.developmentMode
            ? '/js/app.js'
            : '/js/app.min.js';
        return (
            <html>
            <head>
                <meta charSet='utf-8'/>
                <title>
                    {this.props.misc && this.props.misc.metaTitle}
                </title>
                <link href={styleSheetHref} rel="stylesheet"/>
            </head>
            <body>
            <div className="container">
                <HeaderComponent {...this.props}/>
                {this.props.children}
            </div>
            </body>
            <script>
                __PRELOADED_DATA__ = ${JSON.stringify(this.props.preloadedData)};
            </script>
            <script async defer src={scriptSrc}></script>
            </html>
        );
    }
});

module.exports = Layout;
