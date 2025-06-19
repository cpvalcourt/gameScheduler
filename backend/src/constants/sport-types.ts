export const SPORT_TYPES = [
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
] as const;

export type SportType = typeof SPORT_TYPES[number];

export const SPORT_TYPES_LOWERCASE = SPORT_TYPES.map(type => type.toLowerCase()); 