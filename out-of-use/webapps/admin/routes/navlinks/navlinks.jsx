var React = require('react');
var Router = require('react-router');

var NavlinksEditor = require('../../components/navlinks-editor/navlinks-editor.jsx');

var NavlinksPage = React.createClass({
    render: function () {
        return <section>
            <NavlinksEditor />
        </section>;
    }
});

module.exports = NavlinksPage;