import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';

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
  let token: string;
  let teamId: number;
  let secondUserId: number;

  beforeAll(async () => {
    // Clean up test data in correct order (child records first)
    await pool.execute('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE name = ?)', ['Integration Test Team']);
    await pool.execute('DELETE FROM teams WHERE name = ?', ['Integration Test Team']);
    await pool.execute('DELETE FROM users WHERE email IN (?, ?)', [testUser.email, secondUser.email]);
    
    // Register and verify test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);
    await pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [testUser.email]);
    // Register and verify second user
    await request(app)
      .post('/api/auth/register')
      .send(secondUser)
      .expect(201);
    await pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [secondUser.email]);
    // Login as test user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    token = res.body.token;
    // Get second user id
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: secondUser.email, password: secondUser.password })
      .expect(200);
    const meRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userRes.body.token}`)
      .expect(200);
    secondUserId = meRes.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data in correct order (child records first)
    await pool.execute('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE name = ?)', ['Integration Test Team']);
    await pool.execute('DELETE FROM teams WHERE name = ?', ['Integration Test Team']);
    await pool.execute('DELETE FROM users WHERE email IN (?, ?)', [testUser.email, secondUser.email]);
  });

  it('should create a new team', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', teamId);
    expect(res.body).toHaveProperty('name', 'Integration Test Team');
  });

  it('should update the team', async () => {
    const res = await request(app)
      .put(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Integration Test Team', description: 'Updated description.' })
      .expect(200);
    expect(res.body).toHaveProperty('team');
    expect(res.body.team.description).toBe('Updated description.');
  });

  it('should add a second user as a member to the team', async () => {
    const res = await request(app)
      .post(`/api/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: secondUser.email, role: 'player' })
      .expect(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should list user teams', async () => {
    const res = await request(app)
      .get('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((team: any) => team.id === teamId)).toBe(true);
  });

  it('should remove the second user from the team', async () => {
    const res = await request(app)
      .delete(`/api/teams/${teamId}/members/${secondUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should delete the team', async () => {
    const res = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('message');
  });
}); 