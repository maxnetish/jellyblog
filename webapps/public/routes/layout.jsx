var React = require('react');
var _ = require('lodash');

var Layout = React.createClass({
    render: function render() {
        var styleSheetHref = this.props.developmentMode ? '/css/app.css' : '/css/app.min.css';
        var scriptSrc = this.props.developmentMode ? '/js/app.js' : '/js/app.min.js';
        return (
            <html>
            <head>
                <meta charSet='utf-8'/>
                <title>
                    {this.props.misc && this.props.misc.metaTitle}
                </title>
                <link rel="stylesheet" href={styleSheetHref}/>
            </head>
            <body>
            {this.props.children}
            <label>Props of layout:</label>
            <pre>{JSON.stringify(_.omit(this.props, ['children']), null, '\t')}</pre>
            </body>
            <script src={scriptSrc} async defer></script>
            </html>
        );
    }
});

module.exports = Layout;