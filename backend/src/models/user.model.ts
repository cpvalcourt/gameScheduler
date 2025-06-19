import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    is_verified: boolean;
    role: 'user' | 'moderator' | 'admin';
    is_active: boolean;
    admin_notes: string | null;
    verification_token: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    date_of_birth: Date | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    role: 'user' | 'moderator' | 'admin';
    is_active: boolean;
    admin_notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export class UserModel {
    static async create(username: string, email: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const [result] = await pool.execute(
            'INSERT INTO USERS (USERNAME, EMAIL, PASSWORD_HASH, IS_VERIFIED, ROLE, IS_ACTIVE, VERIFICATION_TOKEN) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, false, 'user', true, verificationToken]
        );
        const userId = (result as any).insertId;
        const user = await this.findById(userId);
        if (!user) throw new Error('Failed to create user');
        return user;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute('SELECT * FROM USERS WHERE EMAIL = ?', [email]);
        const users = rows as any[];
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return {
            id: user.ID,
            username: user.USERNAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            is_verified: Boolean(user.IS_VERIFIED),
            role: user.ROLE || 'user',
            is_active: Boolean(user.IS_ACTIVE),
            admin_notes: user.ADMIN_NOTES,
            verification_token: user.VERIFICATION_TOKEN,
            profile_picture_url: user.PROFILE_PICTURE_URL,
            bio: user.BIO,
            location: user.LOCATION,
            phone: user.PHONE,
            date_of_birth: user.DATE_OF_BIRTH,
            linkedin_url: user.LINKEDIN_URL,
            twitter_url: user.TWITTER_URL,
            website_url: user.WEBSITE_URL,
            created_at: user.CREATED_AT,
            updated_at: user.UPDATED_AT
        };
    }

    static async findById(id: number): Promise<User | null> {
        const [rows] = await pool.execute('SELECT * FROM USERS WHERE ID = ?', [id]);
        const users = rows as any[];
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return {
            id: user.ID,
            username: user.USERNAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            is_verified: Boolean(user.IS_VERIFIED),
            role: user.ROLE || 'user',
            is_active: Boolean(user.IS_ACTIVE),
            admin_notes: user.ADMIN_NOTES,
            verification_token: user.VERIFICATION_TOKEN,
            profile_picture_url: user.PROFILE_PICTURE_URL,
            bio: user.BIO,
            location: user.LOCATION,
            phone: user.PHONE,
            date_of_birth: user.DATE_OF_BIRTH,
            linkedin_url: user.LINKEDIN_URL,
            twitter_url: user.TWITTER_URL,
            website_url: user.WEBSITE_URL,
            created_at: user.CREATED_AT,
            updated_at: user.UPDATED_AT
        };
    }

    static async findByUsername(username: string): Promise<User | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM USERS WHERE USERNAME = ?',
            [username]
        );
        const users = rows as any[];
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return {
            id: user.ID,
            username: user.USERNAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            is_verified: Boolean(user.IS_VERIFIED),
            role: user.ROLE || 'user',
            is_active: Boolean(user.IS_ACTIVE),
            admin_notes: user.ADMIN_NOTES,
            verification_token: user.VERIFICATION_TOKEN,
            profile_picture_url: user.PROFILE_PICTURE_URL,
            bio: user.BIO,
            location: user.LOCATION,
            phone: user.PHONE,
            date_of_birth: user.DATE_OF_BIRTH,
            linkedin_url: user.LINKEDIN_URL,
            twitter_url: user.TWITTER_URL,
            website_url: user.WEBSITE_URL,
            created_at: user.CREATED_AT,
            updated_at: user.UPDATED_AT
        };
    }

    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        if (!hash) {
            throw new Error('Password hash is required for verification');
        }
        return bcrypt.compare(password, hash);
    }

    static async verifyEmail(token: string): Promise<User | null> {
        const [result] = await pool.execute(
            'UPDATE USERS SET IS_VERIFIED = TRUE, VERIFICATION_TOKEN = NULL WHERE VERIFICATION_TOKEN = ?',
            [token]
        );
        if ((result as any).affectedRows === 0) {
            return null;
        }
        const [rows] = await pool.execute('SELECT * FROM USERS WHERE VERIFICATION_TOKEN IS NULL AND IS_VERIFIED = TRUE ORDER BY ID DESC LIMIT 1');
        const users = rows as any[];
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return {
            id: user.ID,
            username: user.USERNAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            is_verified: Boolean(user.IS_VERIFIED),
            role: user.ROLE || 'user',
            is_active: Boolean(user.IS_ACTIVE),
            admin_notes: user.ADMIN_NOTES,
            verification_token: user.VERIFICATION_TOKEN,
            profile_picture_url: user.PROFILE_PICTURE_URL,
            bio: user.BIO,
            location: user.LOCATION,
            phone: user.PHONE,
            date_of_birth: user.DATE_OF_BIRTH,
            linkedin_url: user.LINKEDIN_URL,
            twitter_url: user.TWITTER_URL,
            website_url: user.WEBSITE_URL,
            created_at: user.CREATED_AT,
            updated_at: user.UPDATED_AT
        };
    }

    static async resendVerificationEmail(email: string): Promise<string | null> {
        const user = await this.findByEmail(email);
        if (!user || user.is_verified) return null;
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await pool.execute(
            'UPDATE USERS SET VERIFICATION_TOKEN = ? WHERE ID = ?',
            [verificationToken, user.id]
        );
        return verificationToken;
    }

    static async update(id: number, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'password'>>): Promise<User | null> {
        const setClause = Object.keys(updates)
            .map(key => `${key.toUpperCase()} = ?`)
            .join(', ');
        if (!setClause) return this.findById(id);
        const values = Object.values(updates);
        await pool.execute(
            `UPDATE USERS SET ${setClause}, UPDATED_AT = NOW() WHERE ID = ?`,
            [...values, id]
        );
        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM USERS WHERE ID = ?', [id]);
        return (result as any).affectedRows > 0;
    }

    // Admin methods
    static async findAll(page: number = 1, limit: number = 10, filters: {
        role?: string;
        is_active?: boolean;
        is_verified?: boolean;
        search?: string;
    } = {}): Promise<{ users: UserResponse[]; total: number }> {
        try {
            console.log('UserModel.findAll called with:', { page, limit, filters });
            
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];

            if (filters.role) {
                whereClause += ' AND ROLE = ?';
                params.push(filters.role);
            }

            if (filters.is_active !== undefined) {
                whereClause += ' AND IS_ACTIVE = ?';
                params.push(filters.is_active);
            }

            if (filters.is_verified !== undefined) {
                whereClause += ' AND IS_VERIFIED = ?';
                params.push(filters.is_verified);
            }

            if (filters.search) {
                whereClause += ' AND (USERNAME LIKE ? OR EMAIL LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            console.log('SQL where clause:', whereClause);
            console.log('SQL params:', params);

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM USERS ${whereClause}`;
            console.log('Count query:', countQuery);
            const [countRows] = await pool.execute(countQuery, params);
            const total = (countRows as any[])[0].total;
            console.log('Total count:', total);

            // Get paginated results
            const offset = (page - 1) * limit;
            const selectQuery = `SELECT ID, USERNAME, EMAIL, IS_VERIFIED, ROLE, IS_ACTIVE, ADMIN_NOTES, CREATED_AT, UPDATED_AT 
                                FROM USERS ${whereClause} 
                                ORDER BY CREATED_AT DESC 
                                LIMIT ${limit} OFFSET ${offset}`;
            console.log('Select query:', selectQuery);
            console.log('Select params:', params);
            
            const [rows] = await pool.execute(selectQuery, params);
            console.log('Raw rows from database:', rows);

            const users = (rows as any[]).map(user => ({
                id: user.ID,
                username: user.USERNAME,
                email: user.EMAIL,
                is_verified: Boolean(user.IS_VERIFIED),
                role: user.ROLE || 'user',
                is_active: Boolean(user.IS_ACTIVE),
                admin_notes: user.ADMIN_NOTES,
                created_at: user.CREATED_AT,
                updated_at: user.UPDATED_AT
            }));

            console.log('Processed users:', users);
            return { users, total };
        } catch (error) {
            console.error('Error in UserModel.findAll:', error);
            throw error;
        }
    }

    static async updateRole(id: number, role: 'user' | 'moderator' | 'admin'): Promise<User | null> {
        await pool.execute(
            'UPDATE USERS SET ROLE = ?, UPDATED_AT = NOW() WHERE ID = ?',
            [role, id]
        );
        return this.findById(id);
    }

    static async toggleActiveStatus(id: number): Promise<User | null> {
        await pool.execute(
            'UPDATE USERS SET IS_ACTIVE = NOT IS_ACTIVE, UPDATED_AT = NOW() WHERE ID = ?',
            [id]
        );
        return this.findById(id);
    }

    static async updateAdminNotes(id: number, notes: string): Promise<User | null> {
        await pool.execute(
            'UPDATE USERS SET ADMIN_NOTES = ?, UPDATED_AT = NOW() WHERE ID = ?',
            [notes, id]
        );
        return this.findById(id);
    }

    static async bulkUpdateRole(userIds: number[], role: 'user' | 'moderator' | 'admin'): Promise<number> {
        const [result] = await pool.execute(
            'UPDATE USERS SET ROLE = ?, UPDATED_AT = NOW() WHERE ID IN (?)',
            [role, userIds]
        );
        return (result as any).affectedRows;
    }

    static async bulkToggleActiveStatus(userIds: number[], isActive: boolean): Promise<number> {
        const [result] = await pool.execute(
            'UPDATE USERS SET IS_ACTIVE = ?, UPDATED_AT = NOW() WHERE ID IN (?)',
            [isActive, userIds]
        );
        return (result as any).affectedRows;
    }

    static async getStats(): Promise<{
        total: number;
        active: number;
        verified: number;
        byRole: { [key: string]: number };
    }> {
        const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM USERS');
        const [activeRows] = await pool.execute('SELECT COUNT(*) as active FROM USERS WHERE IS_ACTIVE = TRUE');
        const [verifiedRows] = await pool.execute('SELECT COUNT(*) as verified FROM USERS WHERE IS_VERIFIED = TRUE');
        const [roleRows] = await pool.execute('SELECT ROLE, COUNT(*) as count FROM USERS GROUP BY ROLE');

        const total = (totalRows as any[])[0].total;
        const active = (activeRows as any[])[0].active;
        const verified = (verifiedRows as any[])[0].verified;
        
        const byRole: { [key: string]: number } = {};
        (roleRows as any[]).forEach(row => {
            byRole[row.ROLE || 'user'] = row.count;
        });

        return { total, active, verified, byRole };
    }
} 