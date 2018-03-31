import mongoose from 'mongoose';

let optionSchema = new mongoose.Schema({
    // _id
    key: {
        type: String,
        required: true,
        index: true,
        unique: true,
        enum: ['ROBOTS.TXT']
    },
    // Mixed field
    // See ".markModified()" - required for mixed fields
    value: {}
});

export default mongoose.model('Option', optionSchema);