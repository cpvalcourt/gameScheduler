import api from '../services/api';
import type {
  Team,
  TeamWithMembers,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  CreateTeamResponse,
  GetTeamResponse,
  UpdateTeamResponse,
  AddMemberResponse,
  UpdateMemberRoleResponse,
  DeleteTeamResponse,
  RemoveMemberResponse,
} from '../types/team';

// Team CRUD operations
export const createTeam = async (teamData: CreateTeamRequest): Promise<CreateTeamResponse> => {
  const response = await api.post('/teams', teamData);
  return response.data;
};

export const getUserTeams = async (): Promise<Team[]> => {
  const response = await api.get('/teams');
  return response.data;
};

// Alias for getUserTeams to match the expected function name
export const getTeams = getUserTeams;

export const getTeam = async (teamId: number): Promise<GetTeamResponse> => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data;
};

export const getTeamStats = async (teamId: number): Promise<{
  totalMembers: number;
  admins: number;
  captains: number;
  players: number;
  snackProviders: number;
  createdAt: string;
  lastActivity: string;
}> => {
  const response = await api.get(`/teams/${teamId}/stats`);
  return response.data;
};

export const updateTeam = async (teamId: number, teamData: UpdateTeamRequest): Promise<UpdateTeamResponse> => {
  const response = await api.put(`/teams/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId: number): Promise<DeleteTeamResponse> => {
  const response = await api.delete(`/teams/${teamId}`);
  return response.data;
};

// Team member operations
export const addMember = async (teamId: number, memberData: AddMemberRequest): Promise<AddMemberResponse> => {
  const response = await api.post(`/teams/${teamId}/members`, memberData);
  return response.data;
};

export const removeMember = async (teamId: number, memberId: number): Promise<RemoveMemberResponse> => {
  const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
  return response.data;
};

export const updateMemberRole = async (
  teamId: number, 
  memberId: number, 
  roleData: UpdateMemberRoleRequest
): Promise<UpdateMemberRoleResponse> => {
  const response = await api.put(`/teams/${teamId}/members/${memberId}/role`, roleData);
  return response.data;
};

// Helper functions
export const isTeamAdmin = (team: TeamWithMembers, userId: number): boolean => {
  return team.members?.some(member => 
    member.user_id === userId && member.role === 'admin'
  ) || false;
};

export const isTeamCaptain = (team: TeamWithMembers, userId: number): boolean => {
  return team.members?.some(member => 
    member.user_id === userId && member.role === 'captain'
  ) || false;
};

export const isTeamMember = (team: TeamWithMembers, userId: number): boolean => {
  return team.members?.some(member => member.user_id === userId) || false;
};

export const canManageTeam = (team: TeamWithMembers, userId: number): boolean => {
  return isTeamAdmin(team, userId) || isTeamCaptain(team, userId);
};

// Helper functions for Team objects (without members)
export const isTeamCreator = (team: Team, userId: number): boolean => {
  return team.created_by === userId;
};

export const canManageTeamBasic = (team: Team, userId: number): boolean => {
  return isTeamCreator(team, userId);
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'captain':
      return 'Captain';
    case 'player':
      return 'Player';
    case 'snack_provider':
      return 'Snack Provider';
    default:
      return role;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'captain':
      return 'warning';
    case 'player':
      return 'primary';
    case 'snack_provider':
      return 'success';
    default:
      return 'default';
  }
}; 