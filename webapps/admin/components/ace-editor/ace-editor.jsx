var React = require('react/addons');
var Brace = require('brace');
var _ = require('lodash');

require('brace/mode/html');
require('brace/theme/chrome');

var BraceComponent = React.createClass({
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
        this.editor.setFontSize(16);
        this.editor.renderer.setShowGutter(false);
        this.editor.getSession().setMode('ace/mode/html');
        this.editor.setTheme('ace/theme/chrome');
        this.editor.getSession().setUseWrapMode(true);
        this.editor.setShowPrintMargin(false);

        this.editor.setValue(this.props.value, -1);

        this.editor.getSession().on('change', this.handleChange);

        //this.editor.setFontSize(this.props.fontSize);
        //this.editor.on('change', this.onChange);
        //this.editor.renderer.setShowGutter(this.props.showGutter);
        //this.editor.setOption('maxLines', this.props.maxLines);
        //this.editor.setOption('readOnly', this.props.readOnly);
        //this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
        //this.editor.setShowPrintMargin(this.props.setShowPrintMargin);

        //if (this.props.onLoad) {
        //    this.props.onLoad(this.editor);
        //}
    },
    componentWillReceiveProps: function (nextProps) {
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