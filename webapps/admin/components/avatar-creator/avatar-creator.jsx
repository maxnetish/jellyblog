var React = require('react/addons');
var AvatarEditor = require('react-avatar-editor');

var AvatarCreator = React.createClass({
    getInitialState: function () {
        return {
            scale: "1"
        };
    },
    render: function () {
        var scaleDisplay;

        scaleDisplay = parseFloat(this.state.scale).toFixed(1);

        return <div className="avatar-creator">
            <input type="file"
                   className="form-control"
                   onChange={this.onInputFileChange}/>
            <AvatarEditor image={this.state.imgSource}
                          ref="avatarEditor"
                          width={150}
                          height={150}
                          border={50}
                          color={[32, 64, 64, 0.6]} // RGBA
                          scale={this.state.scale}/>

            <div className="input-group">
                <span className="input-group-addon scale-label"><i
                    className="glyphicon glyphicon-zoom-in scale-label-icon"></i>{scaleDisplay}</span>
                <input className="form-control" type="range" max="10" min="1" step="0.1" value={this.state.scale}
                       onChange={this.onScaleChange}/>
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
            scale: e.target.value
        });
    },
    getImageDataUrl: function () {
        return this.refs.avatarEditor.getImage();
    }
});

module.exports = AvatarCreator;