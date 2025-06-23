import { pool } from '../config/database';
import crypto from 'crypto';

export interface TeamInvitation {
    id: number;
    team_id: number;
    invited_by_user_id: number;
    invited_email: string;
    invited_role: 'captain' | 'player';
    invitation_token: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
    // Additional fields for joins
    team_name?: string;
    invited_by_username?: string;
}

export class TeamInvitationModel {
    static async create(
        teamId: number,
        invitedByUserId: number,
        invitedEmail: string,
        invitedRole: 'captain' | 'player'
    ): Promise<TeamInvitation> {
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        const [result] = await pool.execute(
            'INSERT INTO TEAM_INVITATIONS (team_id, invited_by_user_id, invited_email, invited_role, invitation_token, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [teamId, invitedByUserId, invitedEmail, invitedRole, invitationToken, expiresAt]
        );

        const [rows] = await pool.execute(
            'SELECT * FROM TEAM_INVITATIONS WHERE id = ?',
            [(result as any).insertId]
        );

        const results = rows as any[];
        if (!results.length) {
            throw new Error('Failed to create team invitation');
        }

        return this.mapRowToInvitation(results[0]);
    }

    static async findByToken(token: string): Promise<TeamInvitation | null> {
        const [rows] = await pool.execute(
            `SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.invitation_token = ?`,
            [token]
        );

        const results = rows as any[];
        if (!results.length) {
            return null;
        }

        return this.mapRowToInvitation(results[0]);
    }

    static async findByEmail(email: string): Promise<TeamInvitation[]> {
        const [rows] = await pool.execute(
            `SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.invited_email = ?
             ORDER BY ti.created_at DESC`,
            [email]
        );

        return (rows as any[]).map(row => this.mapRowToInvitation(row));
    }

    static async findByTeam(teamId: number): Promise<TeamInvitation[]> {
        const [rows] = await pool.execute(
            `SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.team_id = ?
             ORDER BY ti.created_at DESC`,
            [teamId]
        );

        return (rows as any[]).map(row => this.mapRowToInvitation(row));
    }

    static async updateStatus(token: string, status: 'accepted' | 'declined' | 'expired'): Promise<void> {
        await pool.execute(
            'UPDATE TEAM_INVITATIONS SET status = ? WHERE invitation_token = ?',
            [status, token]
        );
    }

    static async deleteExpired(): Promise<void> {
        await pool.execute(
            'DELETE FROM TEAM_INVITATIONS WHERE expires_at < NOW() AND status = "pending"'
        );
    }

    static async isUserInvitedToTeam(email: string, teamId: number): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT 1 FROM TEAM_INVITATIONS WHERE invited_email = ? AND team_id = ? AND status = "pending"',
            [email, teamId]
        );

        return (rows as any[]).length > 0;
    }

    static async deleteInvitation(id: number): Promise<void> {
        await pool.execute('DELETE FROM TEAM_INVITATIONS WHERE id = ?', [id]);
    }

    private static mapRowToInvitation(row: any): TeamInvitation {
        return {
            id: row.ID,
            team_id: row.TEAM_ID,
            invited_by_user_id: row.INVITED_BY_USER_ID,
            invited_email: row.INVITED_EMAIL,
            invited_role: row.INVITED_ROLE,
            invitation_token: row.INVITATION_TOKEN,
            status: row.STATUS,
            expires_at: row.EXPIRES_AT,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT,
            team_name: row.team_name,
            invited_by_username: row.invited_by_username
        };
    }
} 