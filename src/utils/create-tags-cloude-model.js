import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import round from 'lodash/round';
import sortBy from 'lodash/sortBy';

const steps = 5;

function createTagsCloudModel(tags = []) {
    let tagMin = minBy(tags, 'count');
    let tagMax = maxBy(tags, 'count');
    let countMin = (tagMin && tagMin.count) || 1;
    let countMax = (tagMax && tagMax.count) || 1;
    let dispenceWidth = countMax - countMin;
    let dispenceUnit = dispenceWidth / steps;

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