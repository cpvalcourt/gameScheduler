"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
class UserModel {
    static async create(username, email, password) {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const [result] = await database_1.pool.execute('INSERT INTO USERS (USERNAME, EMAIL, PASSWORD_HASH, IS_VERIFIED, ROLE, IS_ACTIVE, VERIFICATION_TOKEN) VALUES (?, ?, ?, ?, ?, ?, ?)', [username, email, hashedPassword, false, 'user', true, verificationToken]);
        const userId = result.insertId;
        const user = await this.findById(userId);
        if (!user)
            throw new Error('Failed to create user');
        return user;
    }
    static async findByEmail(email) {
        const [rows] = await database_1.pool.execute('SELECT * FROM USERS WHERE EMAIL = ?', [email]);
        const users = rows;
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
    static async findById(id) {
        const [rows] = await database_1.pool.execute('SELECT * FROM USERS WHERE ID = ?', [id]);
        const users = rows;
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
    static async findByUsername(username) {
        const [rows] = await database_1.pool.execute('SELECT * FROM USERS WHERE USERNAME = ?', [username]);
        const users = rows;
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
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    static async verifyPassword(password, hash) {
        if (!hash) {
            throw new Error('Password hash is required for verification');
        }
        return bcryptjs_1.default.compare(password, hash);
    }
    static async verifyEmail(token) {
        const [result] = await database_1.pool.execute('UPDATE USERS SET IS_VERIFIED = TRUE, VERIFICATION_TOKEN = NULL WHERE VERIFICATION_TOKEN = ?', [token]);
        if (result.affectedRows === 0) {
            return null;
        }
        const [rows] = await database_1.pool.execute('SELECT * FROM USERS WHERE VERIFICATION_TOKEN IS NULL AND IS_VERIFIED = TRUE ORDER BY ID DESC LIMIT 1');
        const users = rows;
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
    static async resendVerificationEmail(email) {
        const user = await this.findByEmail(email);
        if (!user || user.is_verified)
            return null;
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        await database_1.pool.execute('UPDATE USERS SET VERIFICATION_TOKEN = ? WHERE ID = ?', [verificationToken, user.id]);
        return verificationToken;
    }
    static async update(id, updates) {
        const setClause = Object.keys(updates)
            .map(key => `${key.toUpperCase()} = ?`)
            .join(', ');
        if (!setClause)
            return this.findById(id);
        const values = Object.values(updates);
        await database_1.pool.execute(`UPDATE USERS SET ${setClause}, UPDATED_AT = NOW() WHERE ID = ?`, [...values, id]);
        return this.findById(id);
    }
    static async delete(id) {
        const [result] = await database_1.pool.execute('DELETE FROM USERS WHERE ID = ?', [id]);
        return result.affectedRows > 0;
    }
    // Admin methods
    static async findAll(page = 1, limit = 10, filters = {}) {
        try {
            console.log('UserModel.findAll called with:', { page, limit, filters });
            let whereClause = 'WHERE 1=1';
            const params = [];
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
            const [countRows] = await database_1.pool.execute(countQuery, params);
            const total = countRows[0].total;
            console.log('Total count:', total);
            // Get paginated results
            const offset = (page - 1) * limit;
            const selectQuery = `SELECT ID, USERNAME, EMAIL, IS_VERIFIED, ROLE, IS_ACTIVE, ADMIN_NOTES, CREATED_AT, UPDATED_AT 
                                FROM USERS ${whereClause} 
                                ORDER BY CREATED_AT DESC 
                                LIMIT ${limit} OFFSET ${offset}`;
            console.log('Select query:', selectQuery);
            console.log('Select params:', params);
            const [rows] = await database_1.pool.execute(selectQuery, params);
            console.log('Raw rows from database:', rows);
            const users = rows.map(user => ({
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
        }
        catch (error) {
            console.error('Error in UserModel.findAll:', error);
            throw error;
        }
    }
    static async updateRole(id, role) {
        await database_1.pool.execute('UPDATE USERS SET ROLE = ?, UPDATED_AT = NOW() WHERE ID = ?', [role, id]);
        return this.findById(id);
    }
    static async toggleActiveStatus(id) {
        await database_1.pool.execute('UPDATE USERS SET IS_ACTIVE = NOT IS_ACTIVE, UPDATED_AT = NOW() WHERE ID = ?', [id]);
        return this.findById(id);
    }
    static async updateAdminNotes(id, notes) {
        await database_1.pool.execute('UPDATE USERS SET ADMIN_NOTES = ?, UPDATED_AT = NOW() WHERE ID = ?', [notes, id]);
        return this.findById(id);
    }
    static async bulkUpdateRole(userIds, role) {
        const [result] = await database_1.pool.execute('UPDATE USERS SET ROLE = ?, UPDATED_AT = NOW() WHERE ID IN (?)', [role, userIds]);
        return result.affectedRows;
    }
    static async bulkToggleActiveStatus(userIds, isActive) {
        const [result] = await database_1.pool.execute('UPDATE USERS SET IS_ACTIVE = ?, UPDATED_AT = NOW() WHERE ID IN (?)', [isActive, userIds]);
        return result.affectedRows;
    }
    static async getStats() {
        const [totalRows] = await database_1.pool.execute('SELECT COUNT(*) as total FROM USERS');
        const [activeRows] = await database_1.pool.execute('SELECT COUNT(*) as active FROM USERS WHERE IS_ACTIVE = TRUE');
        const [verifiedRows] = await database_1.pool.execute('SELECT COUNT(*) as verified FROM USERS WHERE IS_VERIFIED = TRUE');
        const [roleRows] = await database_1.pool.execute('SELECT ROLE, COUNT(*) as count FROM USERS GROUP BY ROLE');
        const total = totalRows[0].total;
        const active = activeRows[0].active;
        const verified = verifiedRows[0].verified;
        const byRole = {};
        roleRows.forEach(row => {
            byRole[row.ROLE || 'user'] = row.count;
        });
        return { total, active, verified, byRole };
    }
}
exports.UserModel = UserModel;
