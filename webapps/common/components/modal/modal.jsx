var React = require('react/addons');
var ClassSet = require('classnames/dedupe');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var GLOBAL = (function () {return this}());
var document = GLOBAL.document;

var backdropId = 'jb-modal-backdrop-';
var backdropClass = 'modal-backdrop in';

var _lastId = 0;

function getNextId() {
    _lastId++;
    return _lastId;
}

function addBackdrop(id) {
    var idAttr = backdropId + id;
    var backdrop = document.querySelector('#' + idAttr);
    if (backdrop) {
        return backdrop;
    }
    backdrop = (function () {
        var backdropElement = document.createElement('div');
        backdropElement.className = backdropClass;
        backdropElement.id = idAttr;
        return document.body.appendChild(backdropElement);
    })();
    return backdrop;
}

function removeBackdrop(id) {
    var idAttr = backdropId + id;
    var backdrop = document.querySelector('#' + idAttr);
    if (!backdrop) {
        return;
    }
    backdrop.parentNode.removeChild(backdrop);
}

function modifyDocumentBody() {
    document.body.className = ClassSet(document.body.className, {'modal-open': true});
}

function clearDocumentBody() {
    // if no more modals
    // we use async to wait while React updates DOM
    setTimeout(function () {
        var modal = document.querySelector('.modal.jb-modal-visible');
        if (modal) {
            return;
        }
        document.body.className = ClassSet(document.body.className, {'modal-open': false});
    }, 0);
}

var Modal = React.createClass({
    getDefaultProps: function () {
        return {
            visible: false,
            useBackdrop: true
        };
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        this._modalId = this._modalId || getNextId();

        // Here we add backdrop and add .modal-open to body
        // it is not exactly 'React way'
        if (this.props.visible) {
            modifyDocumentBody();
            if (this.props.useBackdrop) {
                addBackdrop(this._modalId);
            }
        } else {
            removeBackdrop(this._modalId);
            clearDocumentBody();
        }

        return <ReactCSSTransitionGroup component="div" transitionName="modal-animate">
            {this.props.visible ? <div key={this._modalId} className="modal jb-modal-visible" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                </div>
            </div> : null}
        </ReactCSSTransitionGroup>;
    },
    componentDidMount: function(){

    },
    componentWillUnmount: function () {
        removeBackdrop(this._modalId);
        clearDocumentBody();
    }
});

module.exports = Modal;