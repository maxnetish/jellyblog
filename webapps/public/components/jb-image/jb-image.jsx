var React = require('react');
var ClassSet = require('classnames');

var loadingStates = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error'
};

var defaultClasses = {
    LOADING: 'jb-img-loading',
    LOADED: 'jb-img-loaded',
    ERROR: 'jb-img-error'
};

var JbImage = React.createClass({
    getInitialState: function () {
        return {
            loadingState: loadingStates.LOADING
        };
    },
    render: function () {
        var imgClassSet = ClassSet(
            this.props.className,
            (function (props, state) {
                var res = {};
                res[props.loadingClass || defaultClasses.LOADING] = state.loadingState === loadingStates.LOADING;
                res[props.loadedClass || defaultClasses.LOADED] = state.loadingState === loadingStates.LOADED;
                res[props.errorClass || defaultClasses.ERROR] = state.loadingState === loadingStates.ERROR;
                return res;
            })(this.props, this.state)
        );

        return <img {...this.props} className={imgClassSet} onLoad={this.handleLoad}
                                    onError={this.handleError}/>;
    },
    componentDidMount: function () {
        var n = React.findDOMNode(this);
        if (n.complete) {
            console.log('already complete');
            this.handleLoad();
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (this.props.src !== nextProps.src) {
            this.setState({
                loadingState: loadingStates.LOADING
            });
        }
    },
    componentDidUpdate: function (prevProps, prevState) {

    },
    handleLoad: function () {
        console.log('handleLoad: ' + React.findDOMNode(this).complete);
        this.setState({
            loadingState: loadingStates.LOADED
        });
    },
    handleError: function () {
        console.log('handleError');
        this.setState({
            loadingState: loadingStates.ERROR
        });
    }
});

module.exports = JbImage;