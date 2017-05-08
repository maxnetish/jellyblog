/**
 * import ChooseSomething from '../choose-something';
 *
 * @modalDialogDecorator({component: ChooseSomething, modalHookPropKey: 'chooseSomethingModal'})
 * export default class PageComponent extends React.Component {
 *      ...
 *      onShowChooseSomethingDialog(e) {
 *          this.props.chooseSomethingModal
 *              .show(data)
 *              .then(dialogResult => ...)
 *              .catch(rejectreason => ...);
 *
 *      }
 *      ...
 * }
 *
 * Adds props {isOpen, onReject, onResolve} to provided modal component,
 *
 */

import React from 'react';
import {autobind} from 'core-decorators';
import noop from './no-op';

function modalDialogDecorator({modalHookPropKey, component}) {
    if(!(typeof modalHookPropKey === 'string' && modalHookPropKey)) {
        throw new Error('You should pass non empty string as "modalHookPropKey" to decorator.');
    }
    if (typeof component !== 'function') {
        throw new Error('You should pass modal React.Component as "component" to decorator');
    }

    const ModalComponent = component;

    return function (DecoratedComponent) {



        return class extends React.Component {

            constructor(props){
                super(props);

                this.state = {
                    isOpen: false,
                    modalData: {},
                    onResolve: noop,
                    onReject: noop
                };
            }

            @autobind
            modalShow(modalData) {
                let self = this;

                if(this.state.isOpen) {
                    return Promise.reject('Already open');
                }

                return new Promise((resolve, reject)=>{
                    self.setState({
                        isOpen: true,
                        modalData: modalData,
                        onResolve: function(result) {
                            self.setState({
                                isOpen: false,
                                modalData:{},
                                onResolve:noop,
                                onReject: noop
                            });
                            resolve(result);
                        },
                        onReject: function(reason){
                            self.setState({
                                isOpen: false,
                                modalData: {},
                                onResolve:noop,
                                onReject: noop
                            });
                            reject(reason);
                        }
                    });
                });
            }

            @autobind
            modalClose(reason){
                if(!this.state.isOpen) {
                    return;
                }
                this.state.onReject(reason);
            }

            render() {
                let modalHook = {
                    [modalHookPropKey]: {
                        show: this.modalShow,
                        close: this.modalclose
                    }
                };

                return <DecoratedComponent {...modalHook} {...this.props}>
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