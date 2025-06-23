import { pool } from '../config/database';

export interface Team {
    id: number;
    name: string;
    description: string | null;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}

export interface TeamMember {
    id: number;
    team_id: number;
    user_id: number;
    role: 'admin' | 'captain' | 'player' | 'snack_provider';
    created_at: Date;
    updated_at: Date;
    // User information
    username?: string;
    email?: string;
    profile_picture_url?: string;
}

export class TeamModel {
    static async create(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
        const [result] = await pool.execute(
            'INSERT INTO TEAMS (name, description, created_by) VALUES (?, ?, ?)',
            [team.name, team.description, team.created_by]
        );

        const [rows] = await pool.execute(
            'SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?',
            [(result as any).insertId]
        );

        const results = rows as any[];
        if (!results.length) {
            throw new Error('Failed to create team');
        }

        return {
            id: results[0].id,
            name: results[0].name,
            description: results[0].description,
            created_by: results[0].created_by,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at
        };
    }

    static async findById(id: number): Promise<Team | null> {
        const [rows] = await pool.execute(
            'SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?',
            [id]
        );

        const results = rows as any[];
        if (!results.length) {
            return null;
        }

        return {
            id: results[0].id,
            name: results[0].name,
            description: results[0].description,
            created_by: results[0].created_by,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at
        };
    }

    static async update(id: number, updates: Partial<Omit<Team, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Promise<Team | null> {
        const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];

        await pool.execute(
            `UPDATE TEAMS SET ${setClause} WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id: number): Promise<void> {
        // First delete all team members
        await pool.execute('DELETE FROM TEAM_MEMBERS WHERE team_id = ?', [id]);
        // Then delete the team
        await pool.execute('DELETE FROM TEAMS WHERE id = ?', [id]);
    }

    static async addMember(teamId: number, userId: number, role: TeamMember['role']): Promise<TeamMember> {
        const [result] = await pool.execute(
            'INSERT INTO TEAM_MEMBERS (team_id, user_id, role) VALUES (?, ?, ?)',
            [teamId, userId, role]
        );

        const [rows] = await pool.execute(
            'SELECT id, team_id, user_id, role, created_at, updated_at FROM TEAM_MEMBERS WHERE id = ?',
            [(result as any).insertId]
        );

        const results = rows as any[];
        if (!results.length) {
            throw new Error('Failed to add team member');
        }

        return {
            id: results[0].id,
            team_id: results[0].team_id,
            user_id: results[0].user_id,
            role: results[0].role,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at
        };
    }

    static async removeMember(teamId: number, userId: number): Promise<void> {
        await pool.execute(
            'DELETE FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );
    }

    static async updateMemberRole(teamId: number, userId: number, role: TeamMember['role']): Promise<void> {
        await pool.execute(
            'UPDATE TEAM_MEMBERS SET role = ? WHERE team_id = ? AND user_id = ?',
            [role, teamId, userId]
        );
    }

    static async getTeamMembers(teamId: number): Promise<TeamMember[]> {
        const [rows] = await pool.execute(
            `SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.created_at, tm.updated_at,
                    u.username, u.email, u.profile_picture_url
             FROM TEAM_MEMBERS tm
             JOIN USERS u ON tm.user_id = u.id
             WHERE tm.team_id = ?`,
            [teamId]
        );

        return (rows as any[]).map(row => ({
            id: row.id,
            team_id: row.team_id,
            user_id: row.user_id,
            role: row.role,
            created_at: row.created_at,
            updated_at: row.updated_at,
            username: row.username,
            email: row.email,
            profile_picture_url: row.profile_picture_url
        }));
    }

    static async getUserTeams(userId: number): Promise<Team[]> {
        const [rows] = await pool.execute(
            `SELECT t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at
             FROM TEAMS t
             JOIN TEAM_MEMBERS tm ON t.id = tm.team_id
             WHERE tm.user_id = ?`,
            [userId]
        );

        return (rows as any[]).map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
    }

    static async isTeamMember(teamId: number, userId: number): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );

        return (rows as any[]).length > 0;
    }

    static async isTeamAdmin(teamId: number, userId: number): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ? AND role = "admin"',
            [teamId, userId]
        );

        return (rows as any[]).length > 0;
    }

    static async getTeamStats(teamId: number): Promise<{
        totalMembers: number;
        admins: number;
        captains: number;
        players: number;
        snackProviders: number;
        createdAt: Date;
        lastActivity: Date;
    }> {
        const [memberRows] = await pool.execute(
            `SELECT role, created_at FROM TEAM_MEMBERS WHERE team_id = ?`,
            [teamId]
        );

        const [teamRows] = await pool.execute(
            `SELECT created_at, updated_at FROM TEAMS WHERE id = ?`,
            [teamId]
        );

        const members = memberRows as any[];
        const team = (teamRows as any[])[0];

        const stats = {
            totalMembers: members.length,
            admins: members.filter(m => m.role === 'admin').length,
            captains: members.filter(m => m.role === 'captain').length,
            players: members.filter(m => m.role === 'player').length,
            snackProviders: members.filter(m => m.role === 'snack_provider').length,
            createdAt: team.created_at,
            lastActivity: team.updated_at
        };

        return stats;
    }
} 