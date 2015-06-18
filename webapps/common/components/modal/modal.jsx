var React = require('react/addons');
var ClassSet = require('classnames/dedupe');

var GLOBAL = (function () {return this}());
var document = GLOBAL.document;

var backdropId = 'jb-modal-backdrop';
var backdropClass = 'modal-backdrop';
var backdropClassVisible = 'jb-modal-backdrop-visible in';

function getBackdrop() {
    var backdrop = document.querySelector('#' + backdropId + '.' + backdropClass);
    if (!backdrop) {
        backdrop = (function () {
            var backdropElement = document.createElement('div');
            backdropElement.className = backdropClass;
            backdropElement.id = backdropId;
            return document.body.appendChild(backdropElement);
        })();
    }
    return backdrop;
}

function addBackdrop() {
    var backdrop = getBackdrop();
    backdrop.className = ClassSet(backdropClass, backdropClassVisible);
    document.body.className = ClassSet(document.body.className, 'modal-open');
}

function hideBackdrop() {
    getBackdrop().className = backdropClass;
    document.body.className = ClassSet(document.body.className, {'modal-open': false});
}

var Modal = React.createClass({
    getDefaultProps: function () {
        return {
            visible: false
        };
    },
    getInitialState: function () {
        return {};
    },
    render: function () {

        if (this.props.visible) {
            addBackdrop();
        } else {
            hideBackdrop();
        }

        return this.props.visible ? <div className="modal jb-modal-visible" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    {this.props.children}
                </div>
            </div>
        </div> : null;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        //console.log('Modal wants to update....');
        //console.log('Will update: ' + (this.props.visible != nextProps.visible));
        //return this.props.visible != nextProps.visible;
        return true;
    },
    componentWillUnmount: function () {
        hideBackdrop();
    }
});

module.exports = Modal;