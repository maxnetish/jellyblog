var React = require('react');
var _ = require('lodash');

var loadingStates = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error'
};

function onSourceChanged(imgNode) {
    console.log('onSourceChanged: ' + imgNode);

}

var JbImage = React.createClass({
    getInitialState: function () {
        return {
            loadingState: loadingStates.LOADING
        };
    },
    render: function () {
        return <img {...this.props} onLoad={this.handleLoad}/>;
    },
    componentDidMount: function () {
        var n = React.findDOMNode(this);
        if(n.complete){
            this.handleLoad();
        }
    },
    componentWillReceiveProps: function(nextProps){
        if(this.props.src!==nextProps.src){
            this.setState({
                loadingState: loadingStates.LOADING
            });
        }
    },
    componentDidUpdate: function (prevProps, prevState) {

    },
    handleLoad: function(){
        console.log('load event fire');
    }
});

module.exports = JbImage;