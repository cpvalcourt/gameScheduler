"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
describe('Game Series Routes Integration', () => {
    const testUser = {
        email: 'series@example.com',
        username: 'seriestestuser',
        password: 'TestPass123!'
    };
    let token;
    let seriesId;
    beforeAll(async () => {
        // Clean up test data in correct order (child records first)
        await database_1.pool.execute('DELETE FROM games WHERE series_id IN (SELECT id FROM game_series WHERE name = ?)', ['Integration Test Series']);
        await database_1.pool.execute('DELETE FROM game_series WHERE name = ?', ['Integration Test Series']);
        await database_1.pool.execute('DELETE FROM users WHERE email = ?', [testUser.email]);
        // Register and verify test user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);
        await database_1.pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [testUser.email]);
        // Login
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);
        token = res.body.token;
    });
    afterAll(async () => {
        // Clean up test data in correct order (child records first)
        await database_1.pool.execute('DELETE FROM games WHERE series_id IN (SELECT id FROM game_series WHERE name = ?)', ['Integration Test Series']);
        await database_1.pool.execute('DELETE FROM game_series WHERE name = ?', ['Integration Test Series']);
        await database_1.pool.execute('DELETE FROM users WHERE email = ?', [testUser.email]);
    });
    it('should create a new game series', async () => {
        const seriesData = {
            name: 'Integration Test Series',
            description: 'A game series for integration testing.',
            type: 'tournament',
            start_date: '2024-07-01',
            end_date: '2024-07-10'
        };
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/game-series')
            .set('Authorization', `Bearer ${token}`)
            .send(seriesData)
            .expect(201);
        expect(res.body).toHaveProperty('series');
        expect(res.body.series).toHaveProperty('id');
        expect(res.body.series.name).toBe('Integration Test Series');
        expect(res.body.series.type).toBe('tournament');
        seriesId = res.body.series.id;
    });
    it('should get the created series by ID', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/game-series/${seriesId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('id', seriesId);
        expect(res.body).toHaveProperty('name', 'Integration Test Series');
        expect(res.body).toHaveProperty('type', 'tournament');
    });
    it('should update the series', async () => {
        const updateData = {
            name: 'Integration Test Series',
            description: 'Updated description for the test series.',
            type: 'tournament',
            start_date: '2024-07-01',
            end_date: '2024-07-10'
        };
        const res = await (0, supertest_1.default)(app_1.default)
            .put(`/api/game-series/${seriesId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData)
            .expect(200);
        expect(res.body).toHaveProperty('series');
        expect(res.body.series).toHaveProperty('description', 'Updated description for the test series.');
    });
    it('should list user series', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/game-series')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((series) => series.id === seriesId)).toBe(true);
    });
    it('should delete the series', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/game-series/${seriesId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('message');
    });
});
