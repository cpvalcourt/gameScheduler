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