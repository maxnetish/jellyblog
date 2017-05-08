import EventEmitter from 'eventemitter3';

const stateSymbol = Symbol('symbolForInternalState'),
    actionsHadlerSymbol = Symbol('symbolForActionsHandler');

function handlerNameFromEventName(eventName) {
    return 'on' + eventName.substring(0, 1).toUpperCase() + eventName.substring(1);
}

class StateStoreBase extends EventEmitter {


    constructor({initialState = {}, actions = {}}={}) {
        super();

        this[stateSymbol] = Object.assign({}, initialState);

        // for (let actionKey in actions) {
        //     actions.on(actionKey, (...passed) => {
        //         this[actionsHadlerSymbol](actionKey, ...passed);
        //     });
        // }

        for (let actionKey in actions) {
            if (actions.hasOwnProperty(actionKey) && (typeof actions[actionKey] === 'function')) {
                let handlerName = handlerNameFromEventName(actionKey);
                actions.on(actionKey, this[handlerName], this);
            }
        }
    }

    // [actionsHadlerSymbol](actionKey, ...passed) {
    //     let handlerName = 'on' + actionKey.substring(0, 1).toUpperCase() + actionKey.substring(1);
    //     if (typeof this[handlerName] === 'function') {
    //         this[handlerName](...passed);
    //     } else {
    //         console.warn(`Could not find event handler [${handlerName}]`);
    //     }
    // }

    getState() {
        return this[stateSymbol];
    }

    assignState(value) {
        Object.assign(this[stateSymbol], value);
    }

    notifyStateChanged() {
        this.emit(StateStoreBase.notificationEventKey, this.getState());
    }

    unbind(actions) {
        for (let actionKey in actions) {
            if (actions.hasOwnProperty(actionKey) && (typeof actions[actionKey] === 'function')) {
                let handlerName = handlerNameFromEventName(actionKey);
                actions.removeListener(actionKey, this[handlerName]);
            }
        }
    }

    static get notificationEventKey() {
        return 'stateChanged';
    }

}

export default StateStoreBase;