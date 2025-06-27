"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('User Profile Management', () => {
    let authToken;
    let testUser;
    beforeAll(async () => {
        // Create a test user with unique credentials
        const timestamp = Date.now();
        testUser = await user_model_1.UserModel.create(`testuser_${timestamp}`, `test_${timestamp}@example.com`, 'password123');
        // Verify the user for testing
        await user_model_1.UserModel.update(testUser.id, { is_verified: true });
        // Generate auth token with the correct secret and payload
        authToken = jsonwebtoken_1.default.sign({ id: testUser.id, email: testUser.email }, 'your_jwt_secret_key_change_this_in_production', { expiresIn: '1h' });
    });
    afterAll(async () => {
        // Clean up test user
        if (testUser) {
            await user_model_1.UserModel.delete(testUser.id);
        }
    });
    describe('GET /users/me', () => {
        it('should get current user profile', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).toHaveProperty('username');
            expect(response.body.user).toHaveProperty('is_verified');
            expect(response.body.user).toHaveProperty('role');
            expect(response.body.user).toHaveProperty('is_active');
            expect(response.body.user).toHaveProperty('created_at');
        });
        it('should return 401 without auth token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/me');
            expect(response.status).toBe(401);
        });
    });
    describe('PUT /users/profile', () => {
        it('should update user profile', async () => {
            const timestamp = Date.now();
            const updateData = {
                username: `updateduser_${timestamp}`,
                email: `updated_${timestamp}@example.com`
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully');
            expect(response.body.user.username).toBe(updateData.username);
            expect(response.body.user.email).toBe(updateData.email);
            expect(response.body.user).toHaveProperty('role');
            expect(response.body.user).toHaveProperty('is_active');
        });
        it('should return 400 for missing fields', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ username: 'test' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Username and email are required');
        });
        it('should return 400 for duplicate email', async () => {
            // Create another user first
            const timestamp = Date.now();
            const otherUser = await user_model_1.UserModel.create(`otheruser_${timestamp}`, `other_${timestamp}@example.com`, 'password123');
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                username: 'testuser',
                email: `other_${timestamp}@example.com` // This email is already taken
            });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email is already taken');
            // Clean up
            await user_model_1.UserModel.delete(otherUser.id);
        });
    });
    describe('PUT /users/change-password', () => {
        it('should change password successfully', async () => {
            const passwordData = {
                currentPassword: 'password123',
                newPassword: 'newpassword123'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Password changed successfully');
        });
        it('should return 400 for incorrect current password', async () => {
            const passwordData = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Current password is incorrect');
        });
        it('should return 400 for short new password', async () => {
            const passwordData = {
                currentPassword: 'password123',
                newPassword: '123'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('New password must be at least 6 characters long');
        });
        it('should return 400 for missing fields', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ currentPassword: 'password123' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Current password and new password are required');
        });
    });
});
