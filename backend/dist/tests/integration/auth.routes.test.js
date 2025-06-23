"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
describe('Auth Routes Integration', () => {
    const testUser = {
        email: 'integration@example.com',
        username: 'integrationuser',
        password: 'TestPass123!'
    };
    let token;
    beforeAll(async () => {
        // Clean up test user if exists
        await database_1.pool.execute('DELETE FROM users WHERE email = ?', [testUser.email]);
    });
    afterAll(async () => {
        await database_1.pool.execute('DELETE FROM users WHERE email = ?', [testUser.email]);
        // Do not close the pool here; it will be closed in global teardown
    });
    it('should register a new user', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/registered/i);
        // Mark the user as verified for testing
        await database_1.pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [testUser.email]);
    });
    it('should login with correct credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
        console.log('Token received:', token);
    });
    it('should not login with wrong password', async () => {
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'WrongPass123!' })
            .expect(401);
    });
    it('should access a protected route with valid token', async () => {
        // You may need to adjust the route to a real protected endpoint
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);
        console.log('Response status:', res.status);
        console.log('Response body:', res.body);
        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('email', testUser.email);
    });
    it('should not access a protected route without token', async () => {
        await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .expect(401);
    });
});
