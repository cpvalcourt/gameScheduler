export type SportType = 'basketball' | 'soccer' | 'volleyball' | 'tennis' | 'baseball';

export type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Game {
    id: number;
    series_id: number;
    name: string;
    description: string;
    sport_type: SportType;
    date: string;
    time: string;
    location: string;
    min_players: number;
    max_players: number;
    status: GameStatus;
    created_by: number;
    created_at: string;
    updated_at: string;
} 