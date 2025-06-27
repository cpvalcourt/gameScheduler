"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamInvitationModel = void 0;
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class TeamInvitationModel {
    static async create(teamId, invitedByUserId, invitedEmail, invitedRole) {
        const invitationToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        const [result] = await database_1.pool.execute('INSERT INTO TEAM_INVITATIONS (team_id, invited_by_user_id, invited_email, invited_role, invitation_token, expires_at) VALUES (?, ?, ?, ?, ?, ?)', [teamId, invitedByUserId, invitedEmail, invitedRole, invitationToken, expiresAt]);
        const [rows] = await database_1.pool.execute('SELECT * FROM TEAM_INVITATIONS WHERE id = ?', [result.insertId]);
        const results = rows;
        if (!results.length) {
            throw new Error('Failed to create team invitation');
        }
        return this.mapRowToInvitation(results[0]);
    }
    static async findByToken(token) {
        const [rows] = await database_1.pool.execute(`SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.invitation_token = ?`, [token]);
        const results = rows;
        if (!results.length) {
            return null;
        }
        return this.mapRowToInvitation(results[0]);
    }
    static async findByEmail(email) {
        const [rows] = await database_1.pool.execute(`SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.invited_email = ?
             ORDER BY ti.created_at DESC`, [email]);
        return rows.map(row => this.mapRowToInvitation(row));
    }
    static async findByTeam(teamId) {
        const [rows] = await database_1.pool.execute(`SELECT ti.*, t.name as team_name, u.username as invited_by_username
             FROM TEAM_INVITATIONS ti
             JOIN TEAMS t ON ti.team_id = t.id
             JOIN USERS u ON ti.invited_by_user_id = u.id
             WHERE ti.team_id = ?
             ORDER BY ti.created_at DESC`, [teamId]);
        return rows.map(row => this.mapRowToInvitation(row));
    }
    static async updateStatus(token, status) {
        await database_1.pool.execute('UPDATE TEAM_INVITATIONS SET status = ? WHERE invitation_token = ?', [status, token]);
    }
    static async deleteExpired() {
        await database_1.pool.execute('DELETE FROM TEAM_INVITATIONS WHERE expires_at < NOW() AND status = "pending"');
    }
    static async isUserInvitedToTeam(email, teamId) {
        const [rows] = await database_1.pool.execute('SELECT 1 FROM TEAM_INVITATIONS WHERE invited_email = ? AND team_id = ? AND status = "pending"', [email, teamId]);
        return rows.length > 0;
    }
    static async deleteInvitation(id) {
        await database_1.pool.execute('DELETE FROM TEAM_INVITATIONS WHERE id = ?', [id]);
    }
    static mapRowToInvitation(row) {
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
exports.TeamInvitationModel = TeamInvitationModel;
