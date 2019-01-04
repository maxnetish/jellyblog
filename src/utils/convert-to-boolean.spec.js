import {expect} from 'chai';

import convertToBoolean from './convert-to-boolean';

describe('covert-to-boolean.js', function () {
    it('should export function', function () {
        expect(convertToBoolean).to.be.a('function');
    });
    it('should return boolean as is', function () {
        expect(convertToBoolean(true)).to.equal(true);
        expect(convertToBoolean(false)).to.equal(false);
    });
    it('should convert "false", "off", "0", "" to false, other string to true', function () {
        expect(convertToBoolean('false')).to.equal(false);
        expect(convertToBoolean('off')).to.equal(false);
        expect(convertToBoolean('0')).to.equal(false);
        expect(convertToBoolean('')).to.equal(false);
        expect(convertToBoolean('other string')).to.equal(true);
    });
    it('should convert non-string, non-boolean values as js usually does', function () {
        expect(convertToBoolean()).to.equal(false);
        expect(convertToBoolean([])).to.equal(true);
        expect(convertToBoolean({})).to.equal(true);
        expect(convertToBoolean([0])).to.equal(true);
        expect(convertToBoolean(1)).to.equal(true);
        expect(convertToBoolean(0)).to.equal(false);
        expect(convertToBoolean(NaN)).to.equal(false);
        expect(convertToBoolean(null)).to.equal(false);
        expect(convertToBoolean(() => false)).to.equal(true);
    });
});