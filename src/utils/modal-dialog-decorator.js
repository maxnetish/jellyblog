/**
 * import ChooseSomething from '../choose-something';
 * const chooseSomethingModal = {};
 *
 * @modalDialogDecorator({component: ChooseSomething, modal: chooseSomethingModal})
 * export default class PageComponent extends React.Component {
 *      ...
 *      onShowChooseSomethingDialog(e) {
 *          chooseSomethingModal.show(data)
 *              .then(dialogResult => ...)
 *              .catch(rejectReason => ...);
 *      }
 *      ...
 * }
 *
 * Adds props {isOpen, onReject, onResolve} to provided modal component,
 *
 */

import React from 'react';

import {autobind} from 'core-decorators';
import EventEmitter from 'eventemitter3';

function modalDialogDecorator({modal, component}) {
    if (typeof modal !== 'object') {
        throw new Error('You should pass Object as "modal" to decorator.');
    }
    if (typeof component !== 'function') {
        throw new Error('You should pass modal React.Component as "component" to decorator');
    }

    const changeInternalsEvent = Symbol('change modal internals');
    const emitter = new EventEmitter();
    const ModalComponent = component;

    const internals = {
        isOpen: false
    };

    modal.show = function (modalData) {
        if (internals.isOpen) {
            return Promise.reject('Already open');
        }

        return new Promise((resolve, reject) => {
            Object.assign(internals, {
                isOpen: true,
                onReject: getOnReject(reject),
                onResolve: getOnResolve(resolve),
                modalData: modalData || null
            });
            emitter.emit(changeInternalsEvent, internals);
        });
    };

    modal.close = function () {
        if (!internals.isOpen) {
            return;
        }
        internals.isOpen = false;
        emitter.emit(changeInternalsEvent, internals);
    };

    function getOnReject(reject) {
        return function (reason) {
            internals.isOpen = false;
            emitter.emit(changeInternalsEvent, internals);
            if (reject) {
                reject(reason);
            }
        }
    }

    function getOnResolve(resolve) {
        return function (data) {
            internals.isOpen = false;
            emitter.emit(changeInternalsEvent, internals);
            if (resolve) {
                resolve(data);
            }
        }
    }


    return function (DecoratedComponent) {
        return class extends React.Component {

            constructor(props){
                super(props);
                this.state = {};
            }

            componentDidMount() {
                emitter.on(changeInternalsEvent, this.onInternalsChange);
            }

            componentWillUnmount() {
                emitter.removeListener(changeInternalsEvent, this.onInternalsChange);
            }

            @autobind
            onInternalsChange(e) {
                this.setState(e);
            }

            render() {
                return <DecoratedComponent {...this.props}>
                    <ModalComponent
                        isOpen={this.state.isOpen}
                        onReject={this.state.onReject}
                        onResolve={this.state.onResolve}
                        {...this.state.modalData}
                    />
                    {this.props.children}
                </DecoratedComponent>;
            }
        };
    };
}

export default modalDialogDecorator;