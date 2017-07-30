import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

const checks = [
    function firstCheck(val) {
        return ObjectId.isValid(val);
    },
    function secondCheck(val) {
        let objectIdFromVal = new ObjectId(val);
        return objectIdFromVal == val;
    }
];


export default function validObjectId(val) {
    return !checks.some(elm => !elm(val));
};