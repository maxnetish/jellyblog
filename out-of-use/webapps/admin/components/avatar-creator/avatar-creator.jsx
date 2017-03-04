var React = require('react');
var AvatarEditor = require('react-avatar-editor');
var _ = require('lodash');

var AvatarCreator = React.createClass({
    propTypes: {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        border: React.PropTypes.number,
        scrollable: React.PropTypes.bool,
        onApply: React.PropTypes.func
    },
    getDefaultProps: function () {
        return {
            width: 150,
            height: 150,
            border: 50,
            scrollable: false,
            onApply: _.noop
        };
    },
    getInitialState: function () {
        return {
            scale: 1
        };
    },
    render: function () {
        var scaleDisplay;
        var scrollStyle = {
            overflowX: this.props.scrollable?'auto':'hidden'
        };

        scaleDisplay = parseFloat(this.state.scale).toFixed(1);

        return <div className="avatar-creator">
            <input type="file"
                   className="form-control"
                   onChange={this.onInputFileChange}/>
            <div style={scrollStyle}>
                <AvatarEditor image={this.state.imgSource}
                              ref="avatarEditor"
                              width={this.props.width}
                              height={this.props.height}
                              border={this.props.border}
                              color={[32, 64, 64, 0.6]} // RGBA
                              scale={this.state.scale}/>
            </div>

            <div className="input-group">
                <span className="input-group-addon scale-label"><i
                    className="glyphicon glyphicon-zoom-in scale-label-icon"></i>{scaleDisplay}</span>
                <input className="form-control" type="range" max="10" min="1" step="0.1" value={this.state.scale}
                       onChange={this.onScaleChange}/>
            </div>

            <div>
                <a href="javascript:void 0" onClick={this.handleApply}>Apply image</a>
            </div>
        </div>;
    },
    onInputFileChange: function (e) {
        var targetInput = e.target;
        var reader;
        var self = this;

        if (!(targetInput.files && targetInput.files[0])) {
            return;
        }

        reader = new FileReader();

        reader.onload = function (loadEvent) {
            var dataUri = loadEvent.target.result;
            self.setState({
                imgSource: dataUri
            });
            console.log(dataUri);
        };

        reader.onerror = function (event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };

        reader.readAsDataURL(targetInput.files[0]);
    },
    onScaleChange: function (e) {
        this.setState({
            scale: parseFloat(e.target.value)
        });
    },
    handleApply: function(e){
        this.props.onApply({
            image: this.refs.avatarEditor.getImage()
        });
    },
    getImageDataUrl: function () {
        return this.refs.avatarEditor.getImage();
    }
});

module.exports = AvatarCreator;