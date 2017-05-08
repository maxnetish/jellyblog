var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./title-image-list-flux');

function renderOneTitleImage(fileMetaObject, clickHandler, removeHandler, selected) {
    var liClassSet = ClassSet({
        'col-md-6': true,
        'title-image-item': true,
        'title-image-item-selected': selected
    });

    var xMarkup = <div key={fileMetaObject.id} className={liClassSet}>
        <img style={{width:'100%'}}
             onClick={clickHandler.bind(null, fileMetaObject)}
             title="Choose"
             src={fileMetaObject.url}/>
        <button type="button"
                onClick={removeHandler.bind(null, fileMetaObject)}
                title="Remove from list"
                className="close title-image-item-remove-button"
                aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>;

    return xMarkup;
}

var TitleImageList = React.createClass({
    mixins: [Reflux.ListenerMixin],
    propTypes: {
        onSelect: React.PropTypes.func
    },
    getDefaultProps: function () {
        return {
            onSelect: _.noop
        };
    },
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <div className="row title-image-list">
            {_.map(this.state.titleImageList, function (fileInfo) {
                return renderOneTitleImage(fileInfo, this.onTitleImageClick, this.onTitleImageRemove, fileInfo.id === (this.state.selectedTitleImage && this.state.selectedTitleImage.id))
            }, this)}
        </div>;
    },
    componentDidMount: function(){
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },

    onStoreChanged: function(newViewModel){
        this.setState(_.cloneDeep(newViewModel));
    },

    onTitleImageClick: function(fileInfo, event){
        this.setState({
            selectedTitleImage: fileInfo
        });
        this.props.onSelect(fileInfo);
    },
    onTitleImageRemove: function(fileInfo, event){
        componentFlux.actions.titleImageRemove(fileInfo);
    }
});

module.exports = TitleImageList;