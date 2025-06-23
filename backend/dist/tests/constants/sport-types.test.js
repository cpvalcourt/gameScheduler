"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sport_types_1 = require("../../constants/sport-types");
describe('Sport Types Constants', () => {
    test('SPORT_TYPES should be an array of strings', () => {
        expect(Array.isArray(sport_types_1.SPORT_TYPES)).toBe(true);
        expect(sport_types_1.SPORT_TYPES.every(type => typeof type === 'string')).toBe(true);
    });
    test('SPORT_TYPES should contain all valid sport types', () => {
        const expectedTypes = [
            'Basketball',
            'Baseball',
            'Football',
            'Soccer',
            'Hockey',
            'Tennis',
            'Road Race',
            'Ultimate Frisbee',
            'Field Hockey',
            'Lacrosse',
            'Cricket'
        ];
        expect(sport_types_1.SPORT_TYPES).toEqual(expectedTypes);
    });
    test('SPORT_TYPES_LOWERCASE should be lowercase versions of SPORT_TYPES', () => {
        expect(sport_types_1.SPORT_TYPES_LOWERCASE).toEqual(sport_types_1.SPORT_TYPES.map(type => type.toLowerCase()));
    });
    test('SPORT_TYPES_LOWERCASE should contain all valid sport types in lowercase', () => {
        const expectedTypes = [
            'basketball',
            'baseball',
            'football',
            'soccer',
            'hockey',
            'tennis',
            'road race',
            'ultimate frisbee',
            'field hockey',
            'lacrosse',
            'cricket'
        ];
        expect(sport_types_1.SPORT_TYPES_LOWERCASE).toEqual(expectedTypes);
    });
});
