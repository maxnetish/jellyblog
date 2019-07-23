import {Schema, model} from 'mongoose';
import {IOptionsDocument} from "../dto/options-document";

const optionSchema = new Schema({
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

export const OptionsModel = model<IOptionsDocument>('Option', optionSchema);
