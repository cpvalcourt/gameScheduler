"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
describe('Team Routes Integration', () => {
    const testUser = {
        email: 'teamtest@example.com',
        username: 'teamtestuser',
        password: 'TestPass123!'
    };
    const secondUser = {
        email: 'teamtest2@example.com',
        username: 'teamtestuser2',
        password: 'TestPass123!'
    };
    let token;
    let teamId;
    let secondUserId;
    beforeAll(async () => {
        // Clean up test data in correct order (child records first)
        await database_1.pool.execute('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE name = ?)', ['Integration Test Team']);
        await database_1.pool.execute('DELETE FROM teams WHERE name = ?', ['Integration Test Team']);
        await database_1.pool.execute('DELETE FROM users WHERE email IN (?, ?)', [testUser.email, secondUser.email]);
        // Register and verify test user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);
        await database_1.pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [testUser.email]);
        // Register and verify second user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(secondUser)
            .expect(201);
        await database_1.pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [secondUser.email]);
        // Login as test user
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);
        token = res.body.token;
        // Get second user id
        const userRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: secondUser.email, password: secondUser.password })
            .expect(200);
        const meRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${userRes.body.token}`)
            .expect(200);
        secondUserId = meRes.body.user.id;
    });
    afterAll(async () => {
        // Clean up test data in correct order (child records first)
        await database_1.pool.execute('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE name = ?)', ['Integration Test Team']);
        await database_1.pool.execute('DELETE FROM teams WHERE name = ?', ['Integration Test Team']);
        await database_1.pool.execute('DELETE FROM users WHERE email IN (?, ?)', [testUser.email, secondUser.email]);
    });
    it('should create a new team', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/teams')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Integration Test Team', description: 'A team for integration testing.' })
            .expect(201);
        expect(res.body).toHaveProperty('team');
        expect(res.body.team).toHaveProperty('id');
        expect(res.body.team.name).toBe('Integration Test Team');
        teamId = res.body.team.id;
    });
    it('should get the created team by ID', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/teams/${teamId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('id', teamId);
        expect(res.body).toHaveProperty('name', 'Integration Test Team');
    });
    it('should update the team', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .put(`/api/teams/${teamId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Integration Test Team', description: 'Updated description.' })
            .expect(200);
        expect(res.body).toHaveProperty('team');
        expect(res.body.team.description).toBe('Updated description.');
    });
    it('should add a second user as a member to the team', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/teams/${teamId}/members`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: secondUser.email, role: 'player' })
            .expect(201);
        expect(res.body).toHaveProperty('message');
    });
    it('should list user teams', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/teams')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((team) => team.id === teamId)).toBe(true);
    });
    it('should remove the second user from the team', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/teams/${teamId}/members/${secondUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('message');
    });
    it('should delete the team', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/teams/${teamId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('message');
    });
});
