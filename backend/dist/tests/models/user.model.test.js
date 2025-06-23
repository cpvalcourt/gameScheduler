"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../models/user.model");
const database_1 = require("../../config/database");
jest.mock('../../config/database', () => ({
    pool: {
        execute: jest.fn(),
        getConnection: jest.fn()
    }
}));
describe('UserModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a new user', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed',
                username: 'testuser',
                is_verified: false,
                role: 'user',
                is_active: false,
                admin_notes: null,
                verification_token: 'token',
                profile_picture_url: null,
                bio: null,
                location: null,
                phone: null,
                date_of_birth: null,
                linkedin_url: null,
                twitter_url: null,
                website_url: null,
                created_at: new Date(),
                updated_at: new Date()
            };
            database_1.pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[{
                        ID: 1,
                        EMAIL: 'test@example.com',
                        PASSWORD_HASH: 'hashed',
                        USERNAME: 'testuser',
                        IS_VERIFIED: 0,
                        ROLE: 'user',
                        IS_ACTIVE: 0,
                        ADMIN_NOTES: null,
                        VERIFICATION_TOKEN: 'token',
                        PROFILE_PICTURE_URL: null,
                        BIO: null,
                        LOCATION: null,
                        PHONE: null,
                        DATE_OF_BIRTH: null,
                        LINKEDIN_URL: null,
                        TWITTER_URL: null,
                        WEBSITE_URL: null,
                        CREATED_AT: mockUser.created_at,
                        UPDATED_AT: mockUser.updated_at
                    }]]);
            const result = await user_model_1.UserModel.create('testuser', 'test@example.com', 'hashed');
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockUser);
        });
    });
    describe('findById', () => {
        it('should find a user by id', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed',
                username: 'testuser',
                is_verified: false,
                role: 'user',
                is_active: false,
                admin_notes: null,
                verification_token: 'token',
                profile_picture_url: null,
                bio: null,
                location: null,
                phone: null,
                date_of_birth: null,
                linkedin_url: null,
                twitter_url: null,
                website_url: null,
                created_at: new Date(),
                updated_at: new Date()
            };
            database_1.pool.execute.mockResolvedValueOnce([[{
                        ID: 1,
                        EMAIL: 'test@example.com',
                        PASSWORD_HASH: 'hashed',
                        USERNAME: 'testuser',
                        IS_VERIFIED: 0,
                        ROLE: 'user',
                        IS_ACTIVE: 0,
                        ADMIN_NOTES: null,
                        VERIFICATION_TOKEN: 'token',
                        PROFILE_PICTURE_URL: null,
                        BIO: null,
                        LOCATION: null,
                        PHONE: null,
                        DATE_OF_BIRTH: null,
                        LINKEDIN_URL: null,
                        TWITTER_URL: null,
                        WEBSITE_URL: null,
                        CREATED_AT: mockUser.created_at,
                        UPDATED_AT: mockUser.updated_at
                    }]]);
            const result = await user_model_1.UserModel.findById(1);
            expect(database_1.pool.execute).toHaveBeenCalledWith('SELECT * FROM USERS WHERE ID = ?', [1]);
            expect(result).toEqual(mockUser);
        });
        it('should return null if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await user_model_1.UserModel.findById(999);
            expect(result).toBeNull();
        });
    });
    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed',
                username: 'testuser',
                is_verified: false,
                role: 'user',
                is_active: false,
                admin_notes: null,
                verification_token: 'token',
                profile_picture_url: null,
                bio: null,
                location: null,
                phone: null,
                date_of_birth: null,
                linkedin_url: null,
                twitter_url: null,
                website_url: null,
                created_at: new Date(),
                updated_at: new Date()
            };
            database_1.pool.execute.mockResolvedValueOnce([[{
                        ID: 1,
                        EMAIL: 'test@example.com',
                        PASSWORD_HASH: 'hashed',
                        USERNAME: 'testuser',
                        IS_VERIFIED: 0,
                        ROLE: 'user',
                        IS_ACTIVE: 0,
                        ADMIN_NOTES: null,
                        VERIFICATION_TOKEN: 'token',
                        PROFILE_PICTURE_URL: null,
                        BIO: null,
                        LOCATION: null,
                        PHONE: null,
                        DATE_OF_BIRTH: null,
                        LINKEDIN_URL: null,
                        TWITTER_URL: null,
                        WEBSITE_URL: null,
                        CREATED_AT: mockUser.created_at,
                        UPDATED_AT: mockUser.updated_at
                    }]]);
            const result = await user_model_1.UserModel.findByEmail('test@example.com');
            expect(database_1.pool.execute).toHaveBeenCalledWith('SELECT * FROM USERS WHERE EMAIL = ?', ['test@example.com']);
            expect(result).toEqual(mockUser);
        });
        it('should return null if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await user_model_1.UserModel.findByEmail('notfound@example.com');
            expect(result).toBeNull();
        });
    });
    describe('update', () => {
        it('should update a user', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed',
                username: 'updateduser',
                is_verified: true,
                role: 'user',
                is_active: false,
                admin_notes: null,
                verification_token: null,
                profile_picture_url: null,
                bio: null,
                location: null,
                phone: null,
                date_of_birth: null,
                linkedin_url: null,
                twitter_url: null,
                website_url: null,
                created_at: new Date(),
                updated_at: new Date()
            };
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[{
                        ID: 1,
                        EMAIL: 'test@example.com',
                        PASSWORD_HASH: 'hashed',
                        USERNAME: 'updateduser',
                        IS_VERIFIED: 1,
                        ROLE: 'user',
                        IS_ACTIVE: 0,
                        ADMIN_NOTES: null,
                        VERIFICATION_TOKEN: null,
                        PROFILE_PICTURE_URL: null,
                        BIO: null,
                        LOCATION: null,
                        PHONE: null,
                        DATE_OF_BIRTH: null,
                        LINKEDIN_URL: null,
                        TWITTER_URL: null,
                        WEBSITE_URL: null,
                        CREATED_AT: mockUser.created_at,
                        UPDATED_AT: mockUser.updated_at
                    }]]);
            const result = await user_model_1.UserModel.update(1, { username: 'updateduser', is_verified: true, verification_token: null });
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockUser);
        });
        it('should return null if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await user_model_1.UserModel.update(999, { username: 'updateduser' });
            expect(result).toBeNull();
        });
    });
    describe('delete', () => {
        it('should delete a user', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            await expect(user_model_1.UserModel.delete(1)).resolves.toBe(true);
            expect(database_1.pool.execute).toHaveBeenCalledWith('DELETE FROM USERS WHERE ID = ?', [1]);
        });
        it('should return false if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            await expect(user_model_1.UserModel.delete(999)).resolves.toBe(false);
        });
    });
});
