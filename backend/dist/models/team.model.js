"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModel = void 0;
const database_1 = require("../config/database");
class TeamModel {
    static async create(team) {
        const [result] = await database_1.pool.execute('INSERT INTO TEAMS (name, description, created_by) VALUES (?, ?, ?)', [team.name, team.description, team.created_by]);
        const [rows] = await database_1.pool.execute('SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?', [result.insertId]);
        const results = rows;
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
    static async findById(id) {
        const [rows] = await database_1.pool.execute('SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?', [id]);
        const results = rows;
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
    static async update(id, updates) {
        const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];
        await database_1.pool.execute(`UPDATE TEAMS SET ${setClause} WHERE id = ?`, values);
        return this.findById(id);
    }
    static async delete(id) {
        // First delete all team members
        await database_1.pool.execute('DELETE FROM TEAM_MEMBERS WHERE team_id = ?', [id]);
        // Then delete the team
        await database_1.pool.execute('DELETE FROM TEAMS WHERE id = ?', [id]);
    }
    static async addMember(teamId, userId, role) {
        const [result] = await database_1.pool.execute('INSERT INTO TEAM_MEMBERS (team_id, user_id, role) VALUES (?, ?, ?)', [teamId, userId, role]);
        const [rows] = await database_1.pool.execute('SELECT id, team_id, user_id, role, created_at, updated_at FROM TEAM_MEMBERS WHERE id = ?', [result.insertId]);
        const results = rows;
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
    static async removeMember(teamId, userId) {
        await database_1.pool.execute('DELETE FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?', [teamId, userId]);
    }
    static async updateMemberRole(teamId, userId, role) {
        await database_1.pool.execute('UPDATE TEAM_MEMBERS SET role = ? WHERE team_id = ? AND user_id = ?', [role, teamId, userId]);
    }
    static async getTeamMembers(teamId) {
        const [rows] = await database_1.pool.execute(`SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.created_at, tm.updated_at,
                    u.username, u.email
             FROM TEAM_MEMBERS tm
             JOIN USERS u ON tm.user_id = u.id
             WHERE tm.team_id = ?`, [teamId]);
        return rows.map(row => ({
            id: row.id,
            team_id: row.team_id,
            user_id: row.user_id,
            role: row.role,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
    }
    static async getUserTeams(userId) {
        const [rows] = await database_1.pool.execute(`SELECT t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at
             FROM TEAMS t
             JOIN TEAM_MEMBERS tm ON t.id = tm.team_id
             WHERE tm.user_id = ?`, [userId]);
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
    }
    static async isTeamMember(teamId, userId) {
        const [rows] = await database_1.pool.execute('SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?', [teamId, userId]);
        return rows.length > 0;
    }
    static async isTeamAdmin(teamId, userId) {
        const [rows] = await database_1.pool.execute('SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ? AND role = "admin"', [teamId, userId]);
        return rows.length > 0;
    }
}
exports.TeamModel = TeamModel;
