export interface Team {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'admin' | 'captain' | 'player' | 'snack_provider';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  username?: string;
  email?: string;
  profile_picture_url?: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

// API Request/Response types
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  email: string;
  role: TeamMember['role'];
}

export interface UpdateMemberRoleRequest {
  role: TeamMember['role'];
}

// API Response types
export interface CreateTeamResponse {
  message: string;
  team: Team;
}

export interface GetTeamResponse extends TeamWithMembers {}

export interface UpdateTeamResponse {
  message: string;
  team: Team;
}

export interface AddMemberResponse {
  message: string;
  member: TeamMember;
}

export interface UpdateMemberRoleResponse {
  message: string;
}

export interface DeleteTeamResponse {
  message: string;
}

export interface RemoveMemberResponse {
  message: string;
}

// Form types for UI components
export interface TeamFormData {
  name: string;
  description: string;
}

export interface MemberFormData {
  email: string;
  role: TeamMember['role'];
}

// UI State types
export interface TeamState {
  teams: Team[];
  currentTeam: TeamWithMembers | null;
  loading: boolean;
  error: string | null;
}

export interface TeamFilters {
  search: string;
  role?: TeamMember['role'];
} 