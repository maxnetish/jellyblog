/**
 *
 */

// import EventEmitter from 'eventemitter3';
import {keyOfUserContext} from '../isomorph-utils/shared';

// function setUserContext(userContext) {
//     window[keyOfUserContext] = Object.assign({}, userContext);
// }

let UserContext = Object.create({}, {
    userName: {
        enumerable: true,
        get: () => window && window[keyOfUserContext] && window[keyOfUserContext].userName
    },
    role: {
        enumerable: true,
        get: () => window && window[keyOfUserContext] && window[keyOfUserContext].role
    }
});

UserContext.setContext = function (user) {
    if (window) {
        window[keyOfUserContext] = Object.assign({}, user);
        // this.emit('changed', user);
    }
};

// EventEmitter.call(UserContext);

export default UserContext;