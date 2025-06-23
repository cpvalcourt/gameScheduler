import apiClient from './axios';

export interface GameSeries {
  id: number;
  name: string;
  description: string;
  sport_type: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export const getGameSeries = async (): Promise<GameSeries[]> => {
  const response = await apiClient.get('/game-series');
  return response.data;
};

export const createGameSeries = async (data: {
  name: string;
  description?: string;
  sport_type: string;
}): Promise<GameSeries> => {
  const response = await apiClient.post('/game-series', data);
  return response.data;
};

export const getGameSeriesById = async (id: number): Promise<GameSeries> => {
  const response = await apiClient.get(`/game-series/${id}`);
  return response.data;
};

export const updateGameSeries = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    sport_type?: string;
  }
): Promise<GameSeries> => {
  const response = await apiClient.put(`/game-series/${id}`, data);
  return response.data;
};

export const deleteGameSeries = async (id: number): Promise<void> => {
  await apiClient.delete(`/game-series/${id}`);
}; 