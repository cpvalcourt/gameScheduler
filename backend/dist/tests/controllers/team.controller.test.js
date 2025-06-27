"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const team_controller_1 = require("../../controllers/team.controller");
const team_model_1 = require("../../models/team.model");
const user_model_1 = require("../../models/user.model");
// Mock the models
jest.mock('../../models/team.model');
jest.mock('../../models/user.model');
const mockedTeamModel = team_model_1.TeamModel;
const mockedUserModel = user_model_1.UserModel;
describe('TeamController', () => {
    let mockRequest;
    let mockResponse;
    let responseObject;
    beforeEach(() => {
        responseObject = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            }),
        };
        jest.clearAllMocks();
    });
    describe('createTeam', () => {
        it('should create a team successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                description: 'A test team',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockRequest = {
                body: { name: 'Test Team', description: 'A test team' },
                user: mockUser
            };
            mockedTeamModel.create.mockResolvedValue(mockTeam);
            mockedTeamModel.addMember.mockResolvedValue({});
            await team_controller_1.TeamController.createTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.message).toBe('Team created successfully');
            expect(responseObject.team).toEqual(mockTeam);
        });
        it('should return 400 if team name is missing', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            mockRequest = {
                body: { description: 'A test team' },
                user: mockUser
            };
            await team_controller_1.TeamController.createTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.message).toBe('Team name is required');
        });
        it('should return 401 if user is not authenticated', async () => {
            mockRequest = {
                body: { name: 'Test Team', description: 'A test team' },
                user: undefined
            };
            await team_controller_1.TeamController.createTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('User not authenticated');
        });
    });
    describe('getTeam', () => {
        it('should return team details with members', async () => {
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                description: 'A test team',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            const mockMembers = [
                {
                    id: 1,
                    team_id: 1,
                    user_id: 1,
                    role: 'admin',
                    created_at: new Date(),
                    updated_at: new Date(),
                    username: 'testuser',
                    email: 'test@example.com'
                }
            ];
            mockRequest = {
                params: { id: '1' }
            };
            mockedTeamModel.findById.mockResolvedValue(mockTeam);
            mockedTeamModel.getTeamMembers.mockResolvedValue(mockMembers);
            await team_controller_1.TeamController.getTeam(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                ...mockTeam,
                members: mockMembers
            });
        });
        it('should return 404 if team not found', async () => {
            mockRequest = {
                params: { id: '999' }
            };
            mockedTeamModel.findById.mockResolvedValue(null);
            await team_controller_1.TeamController.getTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.message).toBe('Team not found');
        });
    });
    describe('updateTeam', () => {
        it('should update team successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            const mockTeam = {
                id: 1,
                name: 'Updated Team',
                description: 'Updated description',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockRequest = {
                params: { id: '1' },
                body: { name: 'Updated Team', description: 'Updated description' },
                user: mockUser
            };
            mockedTeamModel.isTeamAdmin.mockResolvedValue(true);
            mockedTeamModel.update.mockResolvedValue(mockTeam);
            await team_controller_1.TeamController.updateTeam(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Team updated successfully',
                team: mockTeam
            });
        });
        it('should return 403 if user is not team admin', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            mockRequest = {
                params: { id: '1' },
                body: { name: 'Updated Team' },
                user: mockUser
            };
            mockedTeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.updateTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject.message).toBe('Only team admins can update team details');
        });
    });
    describe('deleteTeam', () => {
        it('should delete team successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            mockRequest = {
                params: { id: '1' },
                user: mockUser
            };
            mockedTeamModel.isTeamAdmin.mockResolvedValue(true);
            mockedTeamModel.delete.mockResolvedValue();
            await team_controller_1.TeamController.deleteTeam(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Team deleted successfully'
            });
        });
        it('should return 403 if user is not team admin', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            mockRequest = {
                params: { id: '1' },
                user: mockUser
            };
            mockedTeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.deleteTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject.message).toBe('Only team admins can delete teams');
        });
    });
    describe('getUserTeams', () => {
        it('should return user teams successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            const mockTeams = [
                {
                    id: 1,
                    name: 'Team 1',
                    description: 'Team 1 description',
                    created_by: 1,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];
            mockRequest = {
                user: mockUser
            };
            mockedTeamModel.getUserTeams.mockResolvedValue(mockTeams);
            await team_controller_1.TeamController.getUserTeams(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockTeams);
        });
        it('should return 401 if user is not authenticated', async () => {
            mockRequest = {
                user: undefined
            };
            await team_controller_1.TeamController.getUserTeams(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('User not authenticated');
        });
    });
    describe('getTeamStats', () => {
        it('should return team statistics successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            const mockStats = {
                totalMembers: 5,
                admins: 1,
                captains: 1,
                players: 2,
                snackProviders: 1,
                createdAt: new Date(),
                lastActivity: new Date()
            };
            mockRequest = {
                params: { id: '1' },
                user: mockUser
            };
            mockedTeamModel.isTeamMember.mockResolvedValue(true);
            mockedTeamModel.getTeamStats.mockResolvedValue(mockStats);
            await team_controller_1.TeamController.getTeamStats(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
        });
        it('should return 403 if user is not team member', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser', role: 'user' };
            mockRequest = {
                params: { id: '1' },
                user: mockUser
            };
            mockedTeamModel.isTeamMember.mockResolvedValue(false);
            await team_controller_1.TeamController.getTeamStats(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject.message).toBe('Not authorized to view this team');
        });
    });
});
