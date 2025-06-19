import { GameModel } from '../../models/game.model';
import { pool } from '../../config/database';

jest.mock('../../config/database', () => ({
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn()
  }
}));

describe('GameModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new game', async () => {
      const mockGame = {
        ID: 1,
        SERIES_ID: 1,
        NAME: 'Test Game',
        DESCRIPTION: 'A test game',
        SPORT_TYPE: 'Basketball',
        DATE: '2023-10-01',
        TIME: '14:00',
        LOCATION: 'Test Location',
        MIN_PLAYERS: 5,
        MAX_PLAYERS: 10,
        STATUS: 'scheduled',
        CREATED_BY: 1,
        CREATED_AT: '2023-10-01T14:00:00Z',
        UPDATED_AT: '2023-10-01T14:00:00Z'
      };

      (pool.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockGame]]);

      const result = await GameModel.create({
        series_id: 1,
        name: 'Test Game',
        description: 'A test game',
        sport_type: 'Basketball',
        date: '2023-10-01',
        time: '14:00',
        location: 'Test Location',
        min_players: 5,
        max_players: 10,
        status: 'scheduled',
        created_by: 1
      });

      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: mockGame.ID,
        series_id: mockGame.SERIES_ID,
        name: mockGame.NAME,
        description: mockGame.DESCRIPTION,
        sport_type: mockGame.SPORT_TYPE,
        date: mockGame.DATE,
        time: mockGame.TIME,
        location: mockGame.LOCATION,
        min_players: mockGame.MIN_PLAYERS,
        max_players: mockGame.MAX_PLAYERS,
        status: mockGame.STATUS,
        created_by: mockGame.CREATED_BY,
        created_at: mockGame.CREATED_AT,
        updated_at: mockGame.UPDATED_AT
      });
    });
  });

  describe('findById', () => {
    it('should find a game by id', async () => {
      const mockGame = {
        ID: 1,
        SERIES_ID: 1,
        NAME: 'Test Game',
        DESCRIPTION: 'A test game',
        SPORT_TYPE: 'Basketball',
        DATE: '2023-10-01',
        TIME: '14:00',
        LOCATION: 'Test Location',
        MIN_PLAYERS: 5,
        MAX_PLAYERS: 10,
        STATUS: 'scheduled',
        CREATED_BY: 1,
        CREATED_AT: '2023-10-01T14:00:00Z',
        UPDATED_AT: '2023-10-01T14:00:00Z'
      };

      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockGame]]);
      const result = await GameModel.findById(1);
      expect(pool.execute).toHaveBeenCalledWith('SELECT * FROM GAMES WHERE ID = ?', [1]);
      expect(result).toEqual({
        id: mockGame.ID,
        series_id: mockGame.SERIES_ID,
        name: mockGame.NAME,
        description: mockGame.DESCRIPTION,
        sport_type: mockGame.SPORT_TYPE,
        date: mockGame.DATE,
        time: mockGame.TIME,
        location: mockGame.LOCATION,
        min_players: mockGame.MIN_PLAYERS,
        max_players: mockGame.MAX_PLAYERS,
        status: mockGame.STATUS,
        created_by: mockGame.CREATED_BY,
        created_at: mockGame.CREATED_AT,
        updated_at: mockGame.UPDATED_AT
      });
    });

    it('should return null if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await GameModel.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a game', async () => {
      const mockGame = {
        ID: 1,
        SERIES_ID: 1,
        NAME: 'Updated Game',
        DESCRIPTION: 'A test game',
        SPORT_TYPE: 'Basketball',
        DATE: '2023-10-01',
        TIME: '14:00',
        LOCATION: 'Test Location',
        MIN_PLAYERS: 5,
        MAX_PLAYERS: 10,
        STATUS: 'completed',
        CREATED_BY: 1,
        CREATED_AT: '2023-10-01T14:00:00Z',
        UPDATED_AT: '2023-10-01T14:00:00Z'
      };

      // Mock the findById call
      (pool.execute as jest.Mock).mockResolvedValueOnce([[{
        ID: 1,
        SERIES_ID: 1,
        NAME: 'Test Game',
        DESCRIPTION: 'A test game',
        SPORT_TYPE: 'Basketball',
        DATE: '2023-10-01',
        TIME: '14:00',
        LOCATION: 'Test Location',
        MIN_PLAYERS: 5,
        MAX_PLAYERS: 10,
        STATUS: 'scheduled',
        CREATED_BY: 1,
        CREATED_AT: '2023-10-01T14:00:00Z',
        UPDATED_AT: '2023-10-01T14:00:00Z'
      }]]);
      // Mock the update call
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Mock the final findById call
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockGame]]);

      const result = await GameModel.update(1, { status: 'completed', name: 'Updated Game' });
      expect(pool.execute).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        id: mockGame.ID,
        series_id: mockGame.SERIES_ID,
        name: mockGame.NAME,
        description: mockGame.DESCRIPTION,
        sport_type: mockGame.SPORT_TYPE,
        date: mockGame.DATE,
        time: mockGame.TIME,
        location: mockGame.LOCATION,
        min_players: mockGame.MIN_PLAYERS,
        max_players: mockGame.MAX_PLAYERS,
        status: mockGame.STATUS,
        created_by: mockGame.CREATED_BY,
        created_at: mockGame.CREATED_AT,
        updated_at: mockGame.UPDATED_AT
      });
    });

    it('should return null if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await GameModel.update(999, { status: 'completed' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a game', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      await expect(GameModel.delete(1)).resolves.toBe(true);
      expect(pool.execute).toHaveBeenCalledWith('DELETE FROM GAMES WHERE ID = ?', [1]);
    });

    it('should return false if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      await expect(GameModel.delete(999)).resolves.toBe(false);
    });
  });
}); 