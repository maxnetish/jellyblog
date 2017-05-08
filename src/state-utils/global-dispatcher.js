import EventEmitter from 'eventemitter3';

const GlobalEvents = {
    USER_CHANGED: Symbol('USER_CHANGED')
};

const emitter = new EventEmitter();

// use singleton: to use in client only
const globalDispatcher = Object.create(emitter, {
    eventKeys: {
        enumerable: true,
        get: () => GlobalEvents
    }
});

export default globalDispatcher;