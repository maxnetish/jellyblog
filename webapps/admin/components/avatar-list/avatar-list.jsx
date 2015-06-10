var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./avatar-list-flux');

function renderOneAvatar(fileMetaObject, imageSize, clickHandler, removeHandler, selected) {
    var liClassSet = ClassSet({
        'avatar-item': true,
        'avatar-item-selected': selected
    });

    imageSize = imageSize || {
            height: '100px',
            width: '100px'
        };

    var xMarkup = <li key={fileMetaObject.id} className={liClassSet}>
        <img style={imageSize}
             onClick={clickHandler.bind(null, fileMetaObject)}
             title="Choose"
             src={fileMetaObject.url}/>
        <button type="button"
                onClick={removeHandler.bind(null, fileMetaObject)}
                title="Remove from list"
                className="close avatar-item-remove-button"
                aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </li>;

    return xMarkup;
}

var AvatarList = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getDefaultProps: function () {
        return {
            previewSize: {
                heigth: '100px',
                width: '100px'
            }
        };
    },
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <ul className="avatar-list list-unstyled list-inline">
            {_.map(this.state.avatarList, function (one) {
                return renderOneAvatar
                (one, this.props.previewSize,
                    this.onAvatarClick, this.onAvatarRemove,
                    one.id === (this.state.selectedAvatar && this.state.selectedAvatar.id));
            }, this)}
        </ul>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },

    onStoreChanged: function (newViewModel) {
        this.setState(_.cloneDeep(newViewModel));
    },

    onAvatarClick: function (avatarInfo, event) {
        componentFlux.actions.avatarSelect(avatarInfo);
    },
    onAvatarRemove: function (avatarInfo, event) {
        componentFlux.actions.avatarRemove(avatarInfo);
    }
});

module.exports = AvatarList;

