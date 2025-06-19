import { pool } from '../config/database';
import crypto from 'crypto';

export interface PasswordReset {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    created_at: Date;
}

export class PasswordResetModel {
    static async create(userId: number): Promise<PasswordReset> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const [result] = await pool.execute(
            'INSERT INTO PASSWORD_RESETS (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );

        const [rows] = await pool.execute(
            'SELECT id, user_id, token, expires_at, created_at FROM PASSWORD_RESETS WHERE id = ?',
            [(result as any).insertId]
        );

        const results = rows as any[];
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

    static async findByToken(token: string): Promise<PasswordReset | null> {
        const [rows] = await pool.execute(
            'SELECT id, user_id, token, expires_at, created_at FROM PASSWORD_RESETS WHERE token = ?',
            [token]
        );

        const results = rows as any[];
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

    static async deleteByUserId(userId: number): Promise<void> {
        await pool.execute(
            'DELETE FROM PASSWORD_RESETS WHERE user_id = ?',
            [userId]
        );
    }

    static async deleteByToken(token: string): Promise<void> {
        await pool.execute(
            'DELETE FROM PASSWORD_RESETS WHERE token = ?',
            [token]
        );
    }
} 