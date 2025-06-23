import api from '../services/api';

export interface TeamInvitation {
  id: number;
  email: string;
  role: 'captain' | 'player';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by?: string;
  created_at: string;
  expires_at: string;
}

export interface MyInvitation {
  id: number;
  team_name: string;
  role: 'captain' | 'player';
  invited_by: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export interface SendInvitationRequest {
  teamId: number;
  email: string;
  role: 'captain' | 'player';
}

export const teamInvitationsApi = {
  // Send an invitation to join a team
  sendInvitation: async (data: SendInvitationRequest): Promise<{ message: string; invitation: TeamInvitation }> => {
    const response = await api.post('/team-invitations/send', data);
    return response.data;
  },

  // Get all invitations for a specific team
  getTeamInvitations: async (teamId: number): Promise<{ invitations: TeamInvitation[] }> => {
    const response = await api.get(`/team-invitations/team/${teamId}`);
    return response.data;
  },

  // Get current user's pending invitations
  getMyInvitations: async (): Promise<{ invitations: MyInvitation[] }> => {
    const response = await api.get('/team-invitations/my-invitations');
    return response.data;
  },

  // Accept an invitation
  acceptInvitation: async (token: string): Promise<{ message: string }> => {
    const response = await api.post(`/team-invitations/accept/${token}`);
    return response.data;
  },

  // Decline an invitation
  declineInvitation: async (token: string): Promise<{ message: string }> => {
    const response = await api.post(`/team-invitations/decline/${token}`);
    return response.data;
  },

  // Delete an invitation (admin/captain only)
  deleteInvitation: async (teamId: number, invitationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/team-invitations/${teamId}/${invitationId}`);
    return response.data;
  },
}; 