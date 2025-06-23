"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetModel = void 0;
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class PasswordResetModel {
    static async create(userId) {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const [result] = await database_1.pool.execute('INSERT INTO PASSWORD_RESETS (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, token, expiresAt]);
        const [rows] = await database_1.pool.execute('SELECT id, user_id, token, expires_at, created_at FROM PASSWORD_RESETS WHERE id = ?', [result.insertId]);
        const results = rows;
        if (!results.length) {
            throw new Error('Failed to create password reset');
        }
        return {
            id: results[0].id,
            user_id: results[0].user_id,
            token: results[0].token,
            expires_at: results[0].expires_at,
            created_at: results[0].created_at
        };
    }
    static async findByToken(token) {
        const [rows] = await database_1.pool.execute('SELECT id, user_id, token, expires_at, created_at FROM PASSWORD_RESETS WHERE token = ?', [token]);
        const results = rows;
        if (!results.length) {
            return null;
        }
        return {
            id: results[0].id,
            user_id: results[0].user_id,
            token: results[0].token,
            expires_at: results[0].expires_at,
            created_at: results[0].created_at
        };
    }
    static async deleteByUserId(userId) {
        await database_1.pool.execute('DELETE FROM PASSWORD_RESETS WHERE user_id = ?', [userId]);
    }
    static async deleteByToken(token) {
        await database_1.pool.execute('DELETE FROM PASSWORD_RESETS WHERE token = ?', [token]);
    }
}
exports.PasswordResetModel = PasswordResetModel;
