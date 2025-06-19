import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';
import { UserModel } from '../../models/user.model';
import { GameSeriesModel } from '../../models/game-series.model';
import { GameModel } from '../../models/game.model';
import { TeamModel } from '../../models/team.model';

describe('Game Routes Integration', () => {
  let token: string;
  let userId: number;
  let seriesId: number;
  let gameId: number;
  let teamId: number;

  beforeAll(async () => {
    // Create test user
    const userData = {
      email: 'games@example.com',
      password: 'TestPassword123!',
      first_name: 'Game',
      last_name: 'Tester',
      is_verified: true
    };

    const user = await UserModel.create(userData.first_name, userData.email, userData.password);
    userId = user.id;

    // Update user to be verified
    await UserModel.update(userId, { is_verified: true });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    token = loginResponse.body.token;

    // Create a test series
    const seriesData = {
      name: 'Test Game Series',
      description: 'A series for testing games',
      type: 'tournament' as const,
      start_date: new Date('2024-07-01'),
      end_date: new Date('2024-07-10'),
      created_by: userId
    };

    const series = await GameSeriesModel.create(seriesData);
    seriesId = series.id;

    // Create a test team
    const teamData = {
      name: 'Test Team',
      description: 'A team for testing',
      sport_type: 'basketball',
      max_players: 10
    };

    const team = await TeamModel.create({
      ...teamData,
      created_by: userId
    });
    teamId = team.id;
  });

  afterAll(async () => {
    // Clean up in reverse order
    if (gameId) {
      await GameModel.delete(gameId);
    }
    if (teamId) {
      await TeamModel.delete(teamId);
    }
    if (seriesId) {
      await GameSeriesModel.delete(seriesId);
    }
    if (userId) {
      await UserModel.delete(userId);
    }
    // await pool.end(); // Removed to avoid Jest teardown warning
  });

  it('should create a new game', async () => {
    const gameData = {
      name: 'Integration Test Game',
      description: 'A game for integration testing',
      sport_type: 'Basketball',
      date: '2024-07-05',
      time: '14:00',
      location: 'Test Arena',
      min_players: 4,
      max_players: 10,
      status: 'scheduled'
    };

    const res = await request(app)
      .post(`/api/game-series/${seriesId}/games`)
      .set('Authorization', `Bearer ${token}`)
      .send(gameData)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Integration Test Game');
    expect(res.body.sport_type).toBe('Basketball');
    expect(res.body.status).toBe('scheduled');
    gameId = res.body.id;
  });

  it('should get the created game by ID', async () => {
    const res = await request(app)
      .get(`/api/game-series/${seriesId}/games/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', gameId);
    expect(res.body).toHaveProperty('name', 'Integration Test Game');
    expect(res.body).toHaveProperty('sport_type', 'Basketball');
  });

  it('should update the game', async () => {
    const updateData = {
      name: 'Integration Test Game',
      description: 'Updated description for the test game',
      sport_type: 'Basketball',
      date: '2024-07-05',
      time: '15:00',
      location: 'Updated Test Arena',
      min_players: 4,
      max_players: 10,
      status: 'scheduled'
    };

    const res = await request(app)
      .put(`/api/game-series/${seriesId}/games/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(200);

    expect(res.body).toHaveProperty('game');
    expect(res.body.game).toHaveProperty('description', 'Updated description for the test game');
    expect(res.body.game).toHaveProperty('time');
    expect(res.body.game.time.startsWith('15:00')).toBe(true);
  });

  it('should add a team to the game', async () => {
    const res = await request(app)
      .post(`/api/${gameId}/teams`)
      .set('Authorization', `Bearer ${token}`)
      .send({ team_id: teamId })
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Team added to game successfully');
    expect(res.body).toHaveProperty('gameTeam');
  });

  it('should list games in the series', async () => {
    const res = await request(app)
      .get(`/api/game-series/${seriesId}/games`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((game: any) => game.id === gameId)).toBe(true);
  });

  it('should update game attendance', async () => {
    const attendanceData = {
      status: 'attending',
      notes: 'Looking forward to the game!'
    };

    const res = await request(app)
      .post(`/api/${gameId}/attendance`)
      .set('Authorization', `Bearer ${token}`)
      .send(attendanceData)
      .expect(200);

    expect(res.body).toHaveProperty('message');
  });

  it('should remove a team from the game', async () => {
    const res = await request(app)
      .delete(`/api/${gameId}/teams/${teamId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Team removed from game successfully');
  });

  it('should delete the game', async () => {
    const res = await request(app)
      .delete(`/api/game-series/${seriesId}/games/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Game deleted successfully');
  });
}); 