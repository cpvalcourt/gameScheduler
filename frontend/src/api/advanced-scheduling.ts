import apiClient from './axios';

export interface RecurringPattern {
  id: number;
  series_id: number;
  name: string;
  description: string;
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'custom';
  interval: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  min_players: number;
  max_players: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerAvailability {
  id: number;
  user_id: number;
  date: string;
  time_slot: string;
  status: 'available' | 'unavailable' | 'maybe';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OptimalTimeSlot {
  time: string;
  availablePlayers: number;
  conflicts: number;
}

export interface TeamAvailabilitySummary {
  teamId: number;
  date: string;
  availabilitySummary: Array<{
    timeSlot: string;
    available: number;
    unavailable: number;
    maybe: number;
    notSet: number;
  }>;
}

export interface CreateRecurringPatternData {
  name: string;
  description?: string;
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'custom';
  interval?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  min_players?: number;
  max_players?: number;
  start_date: string;
  end_date: string;
}

export interface SetAvailabilityData {
  date: string;
  time_slot: string;
  status: 'available' | 'unavailable' | 'maybe';
  notes?: string;
}

export interface GenerateGamesData {
  start_date: string;
  end_date: string;
}

export interface FindOptimalTimeSlotData {
  date: string;
  duration?: number;
  min_players?: number;
  max_players?: number;
}

// Recurring Pattern API calls
export const createRecurringPattern = async (
  seriesId: number,
  data: CreateRecurringPatternData
): Promise<{ message: string; pattern: RecurringPattern }> => {
  const response = await apiClient.post(
    `/advanced-scheduling/series/${seriesId}/recurring-patterns`,
    data
  );
  return response.data;
};

export const getRecurringPatterns = async (
  seriesId: number
): Promise<RecurringPattern[]> => {
  const response = await apiClient.get(
    `/advanced-scheduling/series/${seriesId}/recurring-patterns`
  );
  return response.data;
};

export const generateGamesFromPattern = async (
  patternId: number,
  data: GenerateGamesData
): Promise<{
  message: string;
  generatedGameIds: number[];
  pattern: RecurringPattern;
}> => {
  const response = await apiClient.post(
    `/advanced-scheduling/recurring-patterns/${patternId}/generate-games`,
    data
  );
  return response.data;
};

// Player Availability API calls
export const setPlayerAvailability = async (
  data: SetAvailabilityData
): Promise<{ message: string; availability: PlayerAvailability }> => {
  const response = await apiClient.post('/advanced-scheduling/availability', data);
  return response.data;
};

export const getPlayerAvailability = async (
  userId: number,
  startDate: string,
  endDate: string
): Promise<PlayerAvailability[]> => {
  const response = await apiClient.get(
    `/advanced-scheduling/availability/${userId}?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

// Smart Scheduling API calls
export const findOptimalTimeSlot = async (
  seriesId: number,
  data: FindOptimalTimeSlotData
): Promise<{ message: string; optimalSlot: OptimalTimeSlot }> => {
  const response = await apiClient.post(
    `/advanced-scheduling/series/${seriesId}/optimal-time-slot`,
    data
  );
  return response.data;
};

// Team Availability API calls
export const getTeamAvailabilitySummary = async (
  teamId: number,
  date: string
): Promise<TeamAvailabilitySummary> => {
  const response = await apiClient.get(
    `/advanced-scheduling/teams/${teamId}/availability-summary?date=${date}`
  );
  return response.data;
};

// Conflict Detection API calls
export const getGameConflicts = async (
  gameId: number
): Promise<{
  conflictCount: number;
  conflicts: Array<{
    id: number;
    conflict_type: string;
    conflict_details: string;
    severity: string;
    resolved: boolean;
  }>;
}> => {
  const response = await apiClient.get(
    `/advanced-scheduling/games/${gameId}/conflicts`
  );
  return response.data;
}; 