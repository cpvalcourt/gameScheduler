"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_series_controller_1 = require("../../controllers/game-series.controller");
const game_series_model_1 = require("../../models/game-series.model");
jest.mock('../../models/game-series.model');
describe('GameSeriesController', () => {
    let mockRequest;
    let mockResponse;
    let responseObject;
    beforeEach(() => {
        responseObject = {};
        mockRequest = {};
        mockResponse = {
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            }),
            status: jest.fn().mockImplementation((code) => {
                responseObject.statusCode = code;
                return mockResponse;
            }),
        };
        jest.clearAllMocks();
    });
    describe('createSeries', () => {
        const mockSeries = {
            id: 1,
            name: 'Test Series',
            description: 'Test Description',
            type: 'tournament',
            start_date: '2024-07-01',
            end_date: '2024-07-10',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        beforeEach(() => {
            mockRequest.body = {
                name: 'Test Series',
                description: 'Test Description',
                type: 'tournament',
                start_date: '2024-07-01',
                end_date: '2024-07-10',
            };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should create a series successfully', async () => {
            game_series_model_1.GameSeriesModel.create.mockResolvedValue(mockSeries);
            await game_series_controller_1.GameSeriesController.createSeries(mockRequest, mockResponse);
            expect(game_series_model_1.GameSeriesModel.create).toHaveBeenCalledWith({
                name: 'Test Series',
                description: 'Test Description',
                type: 'tournament',
                start_date: new Date('2024-07-01'),
                end_date: new Date('2024-07-10'),
                created_by: 1
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual({
                message: 'Series created successfully',
                series: mockSeries
            });
        });
        it('should return 400 if name is missing', async () => {
            mockRequest.body = { description: 'Test Description', type: 'tournament', start_date: '2024-07-01', end_date: '2024-07-10' };
            await game_series_controller_1.GameSeriesController.createSeries(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Series name is required');
        });
    });
    describe('getSeries', () => {
        const mockSeries = {
            id: 1,
            name: 'Test Series',
            description: 'Test Description',
            type: 'tournament',
            start_date: '2024-07-01',
            end_date: '2024-07-10',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should return series data if found', async () => {
            game_series_model_1.GameSeriesModel.findById.mockResolvedValue(mockSeries);
            await game_series_controller_1.GameSeriesController.getSeries(mockRequest, mockResponse);
            expect(game_series_model_1.GameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(responseObject).toEqual(mockSeries);
        });
        it('should return 404 if series not found', async () => {
            game_series_model_1.GameSeriesModel.findById.mockResolvedValue(null);
            await game_series_controller_1.GameSeriesController.getSeries(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'Series not found');
        });
    });
    describe('updateSeries', () => {
        const mockSeries = {
            id: 1,
            name: 'Updated Series',
            description: 'Updated Description',
            type: 'league',
            start_date: '2024-07-05',
            end_date: '2024-07-15',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.body = {
                name: 'Updated Series',
                description: 'Updated Description',
                type: 'league',
                start_date: '2024-07-05',
                end_date: '2024-07-15',
            };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should update series if user is owner', async () => {
            game_series_model_1.GameSeriesModel.isOwner.mockResolvedValue(true);
            game_series_model_1.GameSeriesModel.update.mockResolvedValue(mockSeries);
            await game_series_controller_1.GameSeriesController.updateSeries(mockRequest, mockResponse);
            expect(game_series_model_1.GameSeriesModel.isOwner).toHaveBeenCalledWith(1, 1);
            expect(game_series_model_1.GameSeriesModel.update).toHaveBeenCalledWith(1, {
                name: 'Updated Series',
                description: 'Updated Description',
                type: 'league',
                start_date: '2024-07-05',
                end_date: '2024-07-15',
            });
            expect(responseObject).toEqual({
                message: 'Series updated successfully',
                series: mockSeries
            });
        });
        it('should return 403 if user is not owner', async () => {
            game_series_model_1.GameSeriesModel.isOwner.mockResolvedValue(false);
            await game_series_controller_1.GameSeriesController.updateSeries(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only the series owner can update the series');
        });
    });
    describe('deleteSeries', () => {
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should delete series if user is owner', async () => {
            game_series_model_1.GameSeriesModel.isOwner.mockResolvedValue(true);
            game_series_model_1.GameSeriesModel.delete.mockResolvedValue(undefined);
            await game_series_controller_1.GameSeriesController.deleteSeries(mockRequest, mockResponse);
            expect(game_series_model_1.GameSeriesModel.isOwner).toHaveBeenCalledWith(1, 1);
            expect(game_series_model_1.GameSeriesModel.delete).toHaveBeenCalledWith(1);
            expect(responseObject).toHaveProperty('message', 'Series deleted successfully');
        });
        it('should return 403 if user is not owner', async () => {
            game_series_model_1.GameSeriesModel.isOwner.mockResolvedValue(false);
            await game_series_controller_1.GameSeriesController.deleteSeries(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only the series owner can delete the series');
        });
    });
    describe('getUserSeries', () => {
        const mockSeriesList = [
            {
                id: 1,
                name: 'Series 1',
                description: 'Desc 1',
                type: 'tournament',
                start_date: '2024-07-01',
                end_date: '2024-07-10',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                name: 'Series 2',
                description: 'Desc 2',
                type: 'league',
                start_date: '2024-07-11',
                end_date: '2024-07-20',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];
        beforeEach(() => {
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should return user series', async () => {
            game_series_model_1.GameSeriesModel.getUserSeries.mockResolvedValue(mockSeriesList);
            await game_series_controller_1.GameSeriesController.getUserSeries(mockRequest, mockResponse);
            expect(game_series_model_1.GameSeriesModel.getUserSeries).toHaveBeenCalledWith(1);
            expect(responseObject).toEqual(mockSeriesList);
        });
    });
});
