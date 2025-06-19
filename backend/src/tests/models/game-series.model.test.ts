import { GameSeriesModel } from '../../models/game-series.model';
import { pool } from '../../config/database';

jest.mock('../../config/database', () => ({
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn()
  }
}));

describe('GameSeriesModel', () => {
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      execute: jest.fn(),
      release: jest.fn()
    };
    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new game series', async () => {
      const mockSeries = {
        ID: 1,
        NAME: 'Test Series',
        DESCRIPTION: 'Test Description',
        TYPE: 'tournament',
        START_DATE: new Date('2024-07-01'),
        END_DATE: new Date('2024-07-10'),
        CREATED_BY: 1,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date()
      };

      (pool.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockSeries]]);

      const result = await GameSeriesModel.create({
        name: 'Test Series',
        description: 'Test Description',
        type: 'tournament',
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-07-10'),
        created_by: 1
      });

      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: mockSeries.ID,
        name: mockSeries.NAME,
        description: mockSeries.DESCRIPTION,
        type: mockSeries.TYPE,
        start_date: mockSeries.START_DATE,
        end_date: mockSeries.END_DATE,
        created_by: mockSeries.CREATED_BY,
        created_at: mockSeries.CREATED_AT,
        updated_at: mockSeries.UPDATED_AT
      });
    });

    it('should throw an error if creation fails', async () => {
      (pool.execute as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(GameSeriesModel.create({
        name: 'Test Series',
        description: 'Test Description',
        type: 'tournament',
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-07-10'),
        created_by: 1
      })).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find a game series by id', async () => {
      const mockSeries = {
        ID: 1,
        NAME: 'Test Series',
        DESCRIPTION: 'Test Description',
        TYPE: 'tournament',
        START_DATE: new Date('2024-07-01'),
        END_DATE: new Date('2024-07-10'),
        CREATED_BY: 1,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date()
      };

      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockSeries]]);

      const result = await GameSeriesModel.findById(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM GAME_SERIES WHERE ID = ?',
        [1]
      );
      expect(result).toEqual({
        id: mockSeries.ID,
        name: mockSeries.NAME,
        description: mockSeries.DESCRIPTION,
        type: mockSeries.TYPE,
        start_date: mockSeries.START_DATE,
        end_date: mockSeries.END_DATE,
        created_by: mockSeries.CREATED_BY,
        created_at: mockSeries.CREATED_AT,
        updated_at: mockSeries.UPDATED_AT
      });
    });

    it('should return null if series not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);

      const result = await GameSeriesModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a game series', async () => {
      const mockSeries = {
        ID: 1,
        NAME: 'Updated Series',
        DESCRIPTION: 'Updated Description',
        TYPE: 'tournament',
        START_DATE: new Date('2024-07-01'),
        END_DATE: new Date('2024-07-10'),
        CREATED_BY: 1,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date()
      };

      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockSeries]]);

      const result = await GameSeriesModel.update(1, {
        name: 'Updated Series',
        description: 'Updated Description'
      });

      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: mockSeries.ID,
        name: mockSeries.NAME,
        description: mockSeries.DESCRIPTION,
        type: mockSeries.TYPE,
        start_date: mockSeries.START_DATE,
        end_date: mockSeries.END_DATE,
        created_by: mockSeries.CREATED_BY,
        created_at: mockSeries.CREATED_AT,
        updated_at: mockSeries.UPDATED_AT
      });
    });

    it('should return null if series not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]); // Mock findById to return empty

      const result = await GameSeriesModel.update(999, {
        name: 'Updated Series'
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a game series', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]); // No games found
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await GameSeriesModel.delete(1);

      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should return false if series not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]); // No games found
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await GameSeriesModel.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true if user is the owner', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[{ id: 1 }]]);

      const result = await GameSeriesModel.isOwner(1, 1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT 1 FROM GAME_SERIES WHERE ID = ? AND CREATED_BY = ?',
        [1, 1]
      );
      expect(result).toBe(true);
    });

    it('should return false if user is not the owner', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);

      const result = await GameSeriesModel.isOwner(1, 999);

      expect(result).toBe(false);
    });
  });
}); 