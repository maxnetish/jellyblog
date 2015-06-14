var React = require('react/addons');
var Router = require('react-router');

var NavlinksEditor = require('../../components/navlinks-editor/navlinks-editor.jsx');

var NavlinksPage = React.createClass({
    render: function () {
        return <section>
            Navlinks page
            <NavlinksEditor />
        </section>;
    }
});

module.exports = NavlinksPage;