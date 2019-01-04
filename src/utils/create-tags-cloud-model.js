import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import round from 'lodash/round';
import sortBy from 'lodash/sortBy';

function createTagsCloudModel(tags = [], steps = 5) {
    const tagMin = minBy(tags, 'count');
    const tagMax = maxBy(tags, 'count');
    const countMin = (tagMin && tagMin.count) || 1;
    const countMax = (tagMax && tagMax.count) || 1;
    const dispenceWidth = countMax - countMin;
    const dispenceUnit = dispenceWidth / steps;

    if (dispenceUnit === 0) {
        return tags;
    }

    let result = tags.map(tagInfo => {
        let relativeCount = (tagInfo.count - countMin) / dispenceUnit;
        relativeCount = round(relativeCount);
        relativeCount = relativeCount > steps ? steps : relativeCount;
        relativeCount = relativeCount === 0 ? 1 : relativeCount;
        return Object.assign(tagInfo, {relativeCount});
    });

    result = sortBy(result, 'tag');

    return result;
}

export default createTagsCloudModel;