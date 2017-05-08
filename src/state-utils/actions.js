import EventEmitter from 'eventemitter3';

const symbols = {
    sync: Symbol('actionHandlerSyncSymbol'),
    async: Symbol('actionHandlerAsyncSymbol')
};

class Actions extends EventEmitter {
    constructor({descriptor = {}}) {
        super();

        for (let actionKey in descriptor) {
            if (!descriptor.hasOwnProperty(actionKey)) {
                continue;
            }
            let handlerSymbol = symbols.sync;

            if (descriptor[actionKey] && descriptor[actionKey].async) {
                handlerSymbol = symbols.async;
            }
            this[actionKey] = (...passed) => this[handlerSymbol](actionKey, ...passed);
        }

    }

    [symbols.sync](actionKey, ...passed) {
        this.emit(actionKey, ...passed);
    }

    [symbols.async](actionKey, ...passed) {
        setTimeout(() => this.emit(actionKey, ...passed), 0);
    }
}

export default Actions;