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
            loadingState: loadingStates.LOADING,
            imageUrl: null
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

        return <img {...this.props} src={this.state.imageUrl}
                                    className={imgClassSet}
                                    onLoad={this.handleLoad}
                                    onError={this.handleError}/>;
    },
    componentDidMount: function () {
        // We change state immediately after mount to bind onLoad,onError BEFORE set img src
        this.setState({
            imageUrl: this.props.src,
            loadingState: loadingStates.LOADING
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var self = this;
        if (this.props.src !== nextProps.src) {
            this.setState({
                loadingState: loadingStates.LOADING
            });
            // Change src after timeout to smoothly fade-out current image
            setTimeout(function () {
                self.setState({
                    imageUrl: nextProps.src
                })
            }, 500);
        }
    },
    componentDidUpdate: function (prevProps, prevState) {

    },
    handleLoad: function () {
        this.setState({
            loadingState: loadingStates.LOADED
        });
    },
    handleError: function () {
        this.setState({
            loadingState: loadingStates.ERROR
        });
    }
});

module.exports = JbImage;