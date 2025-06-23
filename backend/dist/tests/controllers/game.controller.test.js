"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_controller_1 = require("../../controllers/game.controller");
const game_model_1 = require("../../models/game.model");
const game_series_model_1 = require("../../models/game-series.model");
const team_model_1 = require("../../models/team.model");
// Mock the models
jest.mock('../../models/game.model');
jest.mock('../../models/game-series.model');
jest.mock('../../models/team.model');
jest.mock('../../models/user.model');
const mockGameModel = game_model_1.GameModel;
const mockGameSeriesModel = game_series_model_1.GameSeriesModel;
const mockTeamModel = team_model_1.TeamModel;
describe('GameController', () => {
    let mockRequest;
    let mockResponse;
    let mockUser;
    let mockSeries;
    let mockGame;
    let mockTeam;
    beforeEach(() => {
        mockUser = {
            id: 1,
            email: 'test@example.com'
        };
        mockSeries = {
            id: 1,
            name: 'Test Series',
            created_by: 1
        };
        mockGame = {
            id: 1,
            series_id: 1,
            name: 'Test Game',
            description: 'Test Description',
            sport_type: 'Basketball',
            date: '2024-07-01',
            time: '14:00',
            location: 'Test Arena',
            min_players: 4,
            max_players: 10,
            status: 'scheduled',
            created_by: 1
        };
        mockTeam = {
            id: 1,
            name: 'Test Team',
            created_by: 1
        };
        mockRequest = {
            user: mockUser,
            params: {},
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('createGame', () => {
        it('should create a game successfully', async () => {
            mockRequest.params = { seriesId: '1' };
            mockRequest.body = {
                name: 'Test Game',
                description: 'Test Description',
                sport_type: 'Basketball',
                date: '2024-07-01',
                time: '14:00',
                location: 'Test Arena',
                min_players: 4,
                max_players: 10,
                status: 'scheduled'
            };
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.create.mockResolvedValue(mockGame);
            await game_controller_1.GameController.createGame(mockRequest, mockResponse);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.create).toHaveBeenCalledWith({
                series_id: 1,
                name: 'Test Game',
                description: 'Test Description',
                sport_type: 'Basketball',
                date: '2024-07-01',
                time: '14:00',
                location: 'Test Arena',
                min_players: 4,
                max_players: 10,
                status: 'scheduled',
                created_by: 1
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGame);
        });
        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;
            await game_controller_1.GameController.createGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
        });
        it('should return 404 when series not found', async () => {
            mockRequest.params = { seriesId: '1' };
            mockGameSeriesModel.findById.mockResolvedValue(null);
            await game_controller_1.GameController.createGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Game series not found' });
        });
        it('should return 403 when user is not authorized', async () => {
            mockRequest.params = { seriesId: '1' };
            mockSeries.created_by = 2; // Different user
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            await game_controller_1.GameController.createGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized to add games to this series' });
        });
    });
    describe('getGame', () => {
        it('should get a game successfully', async () => {
            mockRequest.params = { id: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            await game_controller_1.GameController.getGame(mockRequest, mockResponse);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGame);
        });
        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;
            await game_controller_1.GameController.getGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
        });
        it('should return 404 when game not found', async () => {
            mockRequest.params = { id: '1' };
            mockGameModel.findById.mockResolvedValue(null);
            await game_controller_1.GameController.getGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Game not found' });
        });
        it('should return 403 when user is not authorized', async () => {
            mockRequest.params = { id: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockSeries.created_by = 2; // Different user
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            await game_controller_1.GameController.getGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized to view this game' });
        });
    });
    describe('updateGame', () => {
        it('should update a game successfully', async () => {
            mockRequest.params = { seriesId: '1', id: '1' };
            mockRequest.body = {
                name: 'Updated Game',
                description: 'Updated Description'
            };
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameModel.update.mockResolvedValue({ ...mockGame, name: 'Updated Game' });
            await game_controller_1.GameController.updateGame(mockRequest, mockResponse);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.update).toHaveBeenCalledWith(1, {
                name: 'Updated Game',
                description: 'Updated Description'
            });
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Game updated successfully',
                game: { ...mockGame, name: 'Updated Game' }
            });
        });
        it('should return 400 when game does not belong to series', async () => {
            mockRequest.params = { seriesId: '1', id: '1' };
            mockGame.series_id = 2; // Different series
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.findById.mockResolvedValue(mockGame);
            await game_controller_1.GameController.updateGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Game does not belong to the specified series' });
        });
    });
    describe('deleteGame', () => {
        it('should delete a game successfully', async () => {
            mockRequest.params = { id: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.delete.mockResolvedValue(true);
            await game_controller_1.GameController.deleteGame(mockRequest, mockResponse);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.delete).toHaveBeenCalledWith(1);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Game deleted successfully' });
        });
        it('should return 500 when deletion fails', async () => {
            mockRequest.params = { id: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.delete.mockResolvedValue(false);
            await game_controller_1.GameController.deleteGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete game' });
        });
    });
    describe('addTeamToGame', () => {
        it('should add team to game successfully', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { team_id: 1 };
            const mockGameTeam = {
                id: 1,
                game_id: 1,
                team_id: 1,
                created_at: new Date()
            };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockTeamModel.findById.mockResolvedValue(mockTeam);
            mockGameModel.addTeam.mockResolvedValue(mockGameTeam);
            await game_controller_1.GameController.addTeamToGame(mockRequest, mockResponse);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockTeamModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.addTeam).toHaveBeenCalledWith(1, 1);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Team added to game successfully',
                gameTeam: mockGameTeam
            });
        });
        it('should return 404 when team not found', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { team_id: 1 };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockTeamModel.findById.mockResolvedValue(null);
            await game_controller_1.GameController.addTeamToGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });
    });
    describe('removeTeamFromGame', () => {
        it('should remove team from game successfully', async () => {
            mockRequest.params = { id: '1', teamId: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.removeTeam.mockResolvedValue(true);
            await game_controller_1.GameController.removeTeamFromGame(mockRequest, mockResponse);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.removeTeam).toHaveBeenCalledWith(1, 1);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Team removed from game successfully' });
        });
        it('should return 404 when team not found in game', async () => {
            mockRequest.params = { id: '1', teamId: '1' };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.removeTeam.mockResolvedValue(false);
            await game_controller_1.GameController.removeTeamFromGame(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Team not found in game' });
        });
    });
    describe('updateAttendance', () => {
        it('should update attendance successfully', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = {
                status: 'attending',
                notes: 'Looking forward to it!'
            };
            mockGameModel.findById.mockResolvedValue(mockGame);
            mockGameModel.updateAttendance.mockResolvedValue({
                id: 1,
                game_id: 1,
                user_id: 1,
                status: 'attending',
                notes: 'Looking forward to it!',
                created_at: new Date(),
                updated_at: new Date()
            });
            await game_controller_1.GameController.updateAttendance(mockRequest, mockResponse);
            expect(mockGameModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.updateAttendance).toHaveBeenCalledWith(1, 1, 'attending', 'Looking forward to it!');
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Attendance updated successfully',
                attendance: {
                    id: 1,
                    game_id: 1,
                    user_id: 1,
                    status: 'attending',
                    notes: 'Looking forward to it!',
                    created_at: expect.any(Date),
                    updated_at: expect.any(Date)
                }
            });
        });
    });
    describe('getSeriesGames', () => {
        it('should get series games successfully', async () => {
            mockRequest.params = { seriesId: '1' };
            const mockGames = [mockGame];
            mockGameSeriesModel.findById.mockResolvedValue(mockSeries);
            mockGameModel.getSeriesGames.mockResolvedValue(mockGames);
            await game_controller_1.GameController.getSeriesGames(mockRequest, mockResponse);
            expect(mockGameSeriesModel.findById).toHaveBeenCalledWith(1);
            expect(mockGameModel.getSeriesGames).toHaveBeenCalledWith(1);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGames);
        });
        it('should return 404 when series not found', async () => {
            mockRequest.params = { seriesId: '1' };
            mockGameSeriesModel.findById.mockResolvedValue(null);
            await game_controller_1.GameController.getSeriesGames(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Game series not found' });
        });
    });
});
