var React = require('react/addons');
var Brace = require('brace');
var _ = require('lodash');

require('brace/mode/html');
require('brace/theme/chrome');

var editorOptions = {
    fontSize: 16,
    showGutter: false,
    mode: 'ace/mode/html',
    theme: 'ace/theme/chrome',
    wrap: true,
    showPrintMargin: false
};

var BraceComponent = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        value: React.PropTypes.string,
        onChange: React.PropTypes.func
    },
    getDefaultProps: function () {
        return {
            className: 'jb-ace-editor form-control',
            value: null,
            onChange: _.noop
        };
    },
    render: function () {
        return <div ref="aceEditorWrapper" className={this.props.className}></div>;
    },
    componentDidMount: function () {
        // instantiate ace editor
        this.editor = Brace.edit(React.findDOMNode(this.refs.aceEditorWrapper));

        this.editor.$blockScrolling = Infinity;

        // set my params
        this.editor.setFontSize(editorOptions.fontSize);
        this.editor.renderer.setShowGutter(editorOptions.showGutter);
        this.editor.getSession().setMode(editorOptions.mode);
        this.editor.setTheme(editorOptions.theme);
        this.editor.getSession().setUseWrapMode(editorOptions.wrap);
        this.editor.setShowPrintMargin(editorOptions.showPrintMargin);

        // set initial value
        this.editor.setValue(this.props.value, -1);

        // listen changes
        this.editor.getSession().on('change', this.handleChange);
    },
    componentWillReceiveProps: function (nextProps) {
        // update value when prop updates
        if (this.editor && this.editor.getValue() !== nextProps.value) {
            this.editor.setValue(nextProps.value, -1);
        }
    },
    handleChange: function(change, src){
        this.props.onChange({
            change: change,
            src: src
        });
    }
});

module.exports = BraceComponent;