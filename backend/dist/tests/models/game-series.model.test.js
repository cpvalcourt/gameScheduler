"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_series_model_1 = require("../../models/game-series.model");
const database_1 = require("../../config/database");
jest.mock('../../config/database', () => ({
    pool: {
        execute: jest.fn(),
        getConnection: jest.fn()
    }
}));
describe('GameSeriesModel', () => {
    let mockConnection;
    beforeEach(() => {
        mockConnection = {
            execute: jest.fn(),
            release: jest.fn()
        };
        database_1.pool.getConnection.mockResolvedValue(mockConnection);
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
            database_1.pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[mockSeries]]);
            const result = await game_series_model_1.GameSeriesModel.create({
                name: 'Test Series',
                description: 'Test Description',
                type: 'tournament',
                start_date: new Date('2024-07-01'),
                end_date: new Date('2024-07-10'),
                created_by: 1
            });
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
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
            database_1.pool.execute.mockRejectedValueOnce(new Error('Database error'));
            await expect(game_series_model_1.GameSeriesModel.create({
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
            database_1.pool.execute.mockResolvedValueOnce([[mockSeries]]);
            const result = await game_series_model_1.GameSeriesModel.findById(1);
            expect(database_1.pool.execute).toHaveBeenCalledWith('SELECT * FROM GAME_SERIES WHERE ID = ?', [1]);
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
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await game_series_model_1.GameSeriesModel.findById(999);
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
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[mockSeries]]);
            const result = await game_series_model_1.GameSeriesModel.update(1, {
                name: 'Updated Series',
                description: 'Updated Description'
            });
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
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
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            database_1.pool.execute.mockResolvedValueOnce([[]]); // Mock findById to return empty
            const result = await game_series_model_1.GameSeriesModel.update(999, {
                name: 'Updated Series'
            });
            expect(result).toBeNull();
        });
    });
    describe('delete', () => {
        it('should delete a game series', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]); // No games found
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            const result = await game_series_model_1.GameSeriesModel.delete(1);
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
            expect(result).toBe(true);
        });
        it('should return false if series not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]); // No games found
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            const result = await game_series_model_1.GameSeriesModel.delete(999);
            expect(result).toBe(false);
        });
    });
    describe('isOwner', () => {
        it('should return true if user is the owner', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[{ id: 1 }]]);
            const result = await game_series_model_1.GameSeriesModel.isOwner(1, 1);
            expect(database_1.pool.execute).toHaveBeenCalledWith('SELECT 1 FROM GAME_SERIES WHERE ID = ? AND CREATED_BY = ?', [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false if user is not the owner', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await game_series_model_1.GameSeriesModel.isOwner(1, 999);
            expect(result).toBe(false);
        });
    });
});
