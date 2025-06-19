import { SPORT_TYPES, SPORT_TYPES_LOWERCASE } from '../../constants/sport-types';

describe('Sport Types Constants', () => {
  test('SPORT_TYPES should be an array of strings', () => {
    expect(Array.isArray(SPORT_TYPES)).toBe(true);
    expect(SPORT_TYPES.every(type => typeof type === 'string')).toBe(true);
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
    expect(SPORT_TYPES).toEqual(expectedTypes);
  });

  test('SPORT_TYPES_LOWERCASE should be lowercase versions of SPORT_TYPES', () => {
    expect(SPORT_TYPES_LOWERCASE).toEqual(
      SPORT_TYPES.map(type => type.toLowerCase())
    );
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
    expect(SPORT_TYPES_LOWERCASE).toEqual(expectedTypes);
  });
}); 