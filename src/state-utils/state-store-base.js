import EventEmitter from 'eventemitter3';

const stateSymbol = Symbol('symbolForInternalState'),
    actionsHadlerSymbol = Symbol('symbolForActionsHandler');

class StateStoreBase extends EventEmitter {


    constructor({initialState = {}, actions = {}}={}) {
        super();

        this[stateSymbol] = Object.assign({}, initialState);

        for (let actionKey in actions) {
            actions.on(actionKey, (...passed) => {
                this[actionsHadlerSymbol](actionKey, ...passed);
            });
        }
    }

    [actionsHadlerSymbol](actionKey, ...passed) {
        let handlerName = 'on' + actionKey.substring(0, 1).toUpperCase() + actionKey.substring(1);
        if (typeof this[handlerName] === 'function') {
            this[handlerName](...passed);
        } else {
            console.warn(`Could not find event handler [${handlerName}]`);
        }
    }

    getState() {
        return this[stateSymbol];
    }

    assignState(value) {
        Object.assign(this[stateSymbol], value);
    }

    notifyStateChanged() {
        this.emit(StateStoreBase.notificationEventKey, this.getState());
    }

    static get notificationEventKey() {
        return 'stateChanged';
    }
}

export default StateStoreBase;