export type SeriesType = 'tournament' | 'league' | 'casual';

export interface GameSeries {
    id: number;
    name: string;
    description: string;
    type: SeriesType;
    start_date: string;
    end_date: string;
    created_by: number;
    created_at: string;
    updated_at: string;
} 