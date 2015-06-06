var React = require('react/addons');
var AvatarEditor = require('react-avatar-editor');

var AvatarCreator = React.createClass({
    getInitialState: function () {
        return {};
    },
    render: function () {
        return <div>
            <input type="file"
                   className="form-control"
                   onChange={this.onInputFileChange}/>
            <AvatarEditor image={this.state.imgSource}
                          width={250}
                          height={250}
                          border={50}
                          color={[64, 128, 255, 0.6]} // RGBA
                          scale={1.2}/>
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
    }
});

module.exports = AvatarCreator;