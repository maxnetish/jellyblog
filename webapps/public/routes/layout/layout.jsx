var React = require('react');
// var _ = require('lodash');

var layoutFlux = require('./layout-flux');

var HeaderComponent = require('../../components/header/header.jsx');

var Layout = React.createClass({
    getInitialState: function () {
        var viewmodel = layoutFlux.store.getViewModel();
        return {
            misc: viewmodel.misc,
            navlinks: viewmodel.navlinks
        };
    },
    render: function render() {
        // pick devMode flag from props!
        var devMode = !!this.props.preloadedData.developmentMode;
        var styleSheetHref = devMode
            ? '/css/app.css'
            : '/css/app.min.css';
        var scriptSrc = devMode
            ? '/js/app.js'
            : '/js/app.min.js';
        return (
            <html>
            <head>
                <meta charSet='utf-8'/>
                <title>
                    {this.state.misc && this.state.misc.metaTitle}
                </title>
                <link href={styleSheetHref} rel="stylesheet"/>
            </head>
            <body>
            <div className="container">
                <HeaderComponent navlinks={this.state.navlinks} {...this.state.misc}/>
                {this.props.children}
            </div>
            </body>
            <script
                dangerouslySetInnerHTML={{'__html': '__PRELOADED_DATA__ = ' + JSON.stringify(this.props.preloadedData) + ';'}}>
            </script>
            <script async defer src={scriptSrc}></script>
            </html>
        );
    }
});

module.exports = Layout;
