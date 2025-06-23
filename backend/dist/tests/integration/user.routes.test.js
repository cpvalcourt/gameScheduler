"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const user_model_1 = require("../../models/user.model");
describe('User Routes Integration', () => {
    let token;
    let userId;
    beforeAll(async () => {
        // Create test user
        const userData = {
            email: 'usertest@example.com',
            password: 'TestPassword123!',
            first_name: 'User',
            last_name: 'Tester',
            is_verified: true
        };
        const user = await user_model_1.UserModel.create(userData.first_name, userData.email, userData.password);
        userId = user.id;
        // Update user to be verified
        await user_model_1.UserModel.update(userId, { is_verified: true });
        // Login to get token
        const loginResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: userData.email,
            password: userData.password
        });
        token = loginResponse.body.token;
    });
    afterAll(async () => {
        // Clean up
        if (userId) {
            await user_model_1.UserModel.delete(userId);
        }
        // Note: No pool.end() here - using global teardown
    });
    it('should get current user profile with valid token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.user).toHaveProperty('id', userId);
        expect(res.body.user).toHaveProperty('email', 'usertest@example.com');
    });
    it('should return 401 when no token is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .expect(401);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No token provided');
    });
    it('should return 401 when invalid token is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Invalid token');
    });
    it('should return 401 when malformed authorization header is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', 'InvalidFormat token')
            .expect(401);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No token provided');
    });
    it('should return 401 when empty authorization header is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', '')
            .expect(401);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No token provided');
    });
});
