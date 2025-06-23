"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const team_controller_1 = require("../../controllers/team.controller");
const team_model_1 = require("../../models/team.model");
const user_model_1 = require("../../models/user.model");
jest.mock('../../models/team.model');
jest.mock('../../models/user.model');
describe('TeamController', () => {
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
    describe('createTeam', () => {
        const mockTeam = {
            id: 1,
            name: 'Test Team',
            description: 'Test Description',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        beforeEach(() => {
            mockRequest.body = {
                name: 'Test Team',
                description: 'Test Description',
            };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should create a team successfully', async () => {
            team_model_1.TeamModel.create.mockResolvedValue(mockTeam);
            team_model_1.TeamModel.addMember.mockResolvedValue({
                id: 1,
                team_id: 1,
                user_id: 1,
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date(),
            });
            await team_controller_1.TeamController.createTeam(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.create).toHaveBeenCalledWith({
                name: 'Test Team',
                description: 'Test Description',
                created_by: 1
            });
            expect(team_model_1.TeamModel.addMember).toHaveBeenCalledWith(1, 1, 'admin');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual({
                message: 'Team created successfully',
                team: mockTeam
            });
        });
        it('should return 400 if name is missing', async () => {
            mockRequest.body = { description: 'Test Description' };
            await team_controller_1.TeamController.createTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Team name is required');
        });
    });
    describe('getTeam', () => {
        const mockTeam = {
            id: 1,
            name: 'Test Team',
            description: 'Test Description',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const mockMembers = [
            {
                id: 1,
                team_id: 1,
                user_id: 1,
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                team_id: 1,
                user_id: 2,
                role: 'member',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];
        beforeEach(() => {
            mockRequest.params = { id: '1' };
        });
        it('should return team data with members if found', async () => {
            team_model_1.TeamModel.findById.mockResolvedValue(mockTeam);
            team_model_1.TeamModel.getTeamMembers.mockResolvedValue(mockMembers);
            await team_controller_1.TeamController.getTeam(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.findById).toHaveBeenCalledWith(1);
            expect(team_model_1.TeamModel.getTeamMembers).toHaveBeenCalledWith(1);
            expect(responseObject).toEqual({ ...mockTeam, members: mockMembers });
        });
        it('should return 404 if team not found', async () => {
            team_model_1.TeamModel.findById.mockResolvedValue(null);
            await team_controller_1.TeamController.getTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'Team not found');
        });
    });
    describe('updateTeam', () => {
        const mockTeam = {
            id: 1,
            name: 'Updated Team',
            description: 'Updated Description',
            created_by: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.body = {
                name: 'Updated Team',
                description: 'Updated Description',
            };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should update team if user is admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(true);
            team_model_1.TeamModel.update.mockResolvedValue(mockTeam);
            await team_controller_1.TeamController.updateTeam(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
            expect(team_model_1.TeamModel.update).toHaveBeenCalledWith(1, {
                name: 'Updated Team',
                description: 'Updated Description',
            });
            expect(responseObject).toEqual({
                message: 'Team updated successfully',
                team: mockTeam
            });
        });
        it('should return 403 if user is not admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.updateTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only team admins can update team details');
        });
    });
    describe('deleteTeam', () => {
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should delete team if user is admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(true);
            team_model_1.TeamModel.delete.mockResolvedValue(undefined);
            await team_controller_1.TeamController.deleteTeam(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
            expect(team_model_1.TeamModel.delete).toHaveBeenCalledWith(1);
            expect(responseObject).toHaveProperty('message', 'Team deleted successfully');
        });
        it('should return 403 if user is not admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.deleteTeam(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only team admins can delete teams');
        });
    });
    describe('addMember', () => {
        const mockUser = {
            id: 2,
            username: 'newmember',
            email: 'newmember@example.com',
        };
        beforeEach(() => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { email: 'newmember@example.com', role: 'member' };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should add member if user is admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(true);
            user_model_1.UserModel.findByEmail.mockResolvedValue(mockUser);
            team_model_1.TeamModel.addMember.mockResolvedValue({
                id: 1,
                team_id: 1,
                user_id: 2,
                role: 'member',
                created_at: new Date(),
                updated_at: new Date(),
            });
            await team_controller_1.TeamController.addMember(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
            expect(user_model_1.UserModel.findByEmail).toHaveBeenCalledWith('newmember@example.com');
            expect(team_model_1.TeamModel.addMember).toHaveBeenCalledWith(1, 2, 'member');
            expect(responseObject).toHaveProperty('message', 'Member added successfully');
        });
        it('should return 403 if user is not admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.addMember(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only team admins can add members');
        });
        it('should return 404 if user not found', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(true);
            user_model_1.UserModel.findByEmail.mockResolvedValue(null);
            await team_controller_1.TeamController.addMember(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'User not found');
        });
    });
    describe('removeMember', () => {
        beforeEach(() => {
            mockRequest.params = { id: '1', memberId: '2' };
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should remove member if user is admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(true);
            team_model_1.TeamModel.removeMember.mockResolvedValue(undefined);
            await team_controller_1.TeamController.removeMember(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
            expect(team_model_1.TeamModel.removeMember).toHaveBeenCalledWith(1, 2);
            expect(responseObject).toHaveProperty('message', 'Member removed successfully');
        });
        it('should return 403 if user is not admin', async () => {
            team_model_1.TeamModel.isTeamAdmin.mockResolvedValue(false);
            await team_controller_1.TeamController.removeMember(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject).toHaveProperty('message', 'Only team admins can remove members');
        });
    });
    describe('getUserTeams', () => {
        const mockTeams = [
            {
                id: 1,
                name: 'Team 1',
                description: 'Description 1',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                name: 'Team 2',
                description: 'Description 2',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];
        beforeEach(() => {
            mockRequest.user = { id: 1, email: 'test@example.com' };
        });
        it('should return user teams', async () => {
            team_model_1.TeamModel.getUserTeams.mockResolvedValue(mockTeams);
            await team_controller_1.TeamController.getUserTeams(mockRequest, mockResponse);
            expect(team_model_1.TeamModel.getUserTeams).toHaveBeenCalledWith(1);
            expect(responseObject).toEqual(mockTeams);
        });
    });
});
