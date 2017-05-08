import mongoose from 'mongoose';

let tagSchema = new mongoose.Schema({
    // _id
    value: {
        type: String,
        required: true,
        index: true,
        unique: true,
        maxlength: 128
    }
});

export default mongoose.model('Tag', tagSchema);