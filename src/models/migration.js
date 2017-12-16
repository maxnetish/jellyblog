import mongoose from 'mongoose';

let migrationSchema = new mongoose.Schema({
    // _id
    key: {
        type: Number,
        required: true,
        index: true,
        unique: false
    },
    tryResult: {
        type: String,
        enum: ['SUCCESS', 'FAILS'],
        default: 'FAILS',
        required: true
    },
    tryDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    // Mixed field
    // See ".markModified()" - required for mixed fields
    tryDetails: {}
});

export default mongoose.model('Migration', migrationSchema);