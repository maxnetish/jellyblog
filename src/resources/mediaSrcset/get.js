import {MediaSrcset} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({tag, visible = 'NOT_SET'}={}) {
    let projection = null;
    let condition = {};
    let opts = {
        lean: true
    };

    if (tag) {
        condition.tag = tag;
    }

    if (visible !== 'NOT_SET') {
        condition.visible = !!visible;
    }

    return MediaSrcset.find(condition, projection, opts)
        .populate('mediaFile')
        .exec();
}

export default fetch;