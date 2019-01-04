import chai from 'chai';
import {expect} from 'chai';
import chaiInteger from 'chai-integer';

import createTagsCloudModel from './create-tags-cloud-model';

chai.use(chaiInteger);

describe('create-tags-cloud-model.js', function () {
    it('should export function', function () {
        expect(createTagsCloudModel).to.be.a('function');
    });
    it('if tags empty should return empty array', function () {
        const result = createTagsCloudModel();
        expect(result).to.be.an('array').that.has.lengthOf(0);
    });
    it('single tag should produce array without relativeCount', function () {
        const result = createTagsCloudModel([
            {
                count: 1
            }
        ], 20);
        expect(result).to.be.a('array').that.has.lengthOf(1);
        expect(result[0]).has.property('count', 1);
        expect(result[0]).has.not.property('relativeCount');
    });
    it('should extend tags with relativeCount, that should be int number between 1 and step parameter inclusive', function () {
        const tags = [1, 2, 3, 4, 5, 41, 52, 63, 74, 85, 96, 107, 0].map(count => ({count}));
        const steps = 10;
        const result = createTagsCloudModel(tags, steps);
        expect(result).to.be.an('array').that.has.lengthOf(tags.length);
        result.forEach(extendedTag => expect(extendedTag.relativeCount).to.be.a('number').above(0).and.below(steps + 1).and.be.an.integer())
    });
});