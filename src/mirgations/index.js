import addDefaultAllow from './10-add-default-allow';
import recreateSessionCollection from './20-recreate-session-collection';

const migrations = [
    addDefaultAllow,
    recreateSessionCollection
];

export default migrations;