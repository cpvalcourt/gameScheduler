import { Request, Response } from 'express';
import { TeamController } from '../../controllers/team.controller';
import { TeamModel } from '../../models/team.model';
import { UserModel } from '../../models/user.model';

jest.mock('../../models/team.model');
jest.mock('../../models/user.model');

describe('TeamController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

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
      (TeamModel.create as jest.Mock).mockResolvedValue(mockTeam);
      (TeamModel.addMember as jest.Mock).mockResolvedValue({
        id: 1,
        team_id: 1,
        user_id: 1,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await TeamController.createTeam(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.create).toHaveBeenCalledWith({
        name: 'Test Team',
        description: 'Test Description',
        created_by: 1
      });
      expect(TeamModel.addMember).toHaveBeenCalledWith(1, 1, 'admin');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        message: 'Team created successfully',
        team: mockTeam
      });
    });

    it('should return 400 if name is missing', async () => {
      mockRequest.body = { description: 'Test Description' };

      await TeamController.createTeam(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.findById as jest.Mock).mockResolvedValue(mockTeam);
      (TeamModel.getTeamMembers as jest.Mock).mockResolvedValue(mockMembers);

      await TeamController.getTeam(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.findById).toHaveBeenCalledWith(1);
      expect(TeamModel.getTeamMembers).toHaveBeenCalledWith(1);
      expect(responseObject).toEqual({ ...mockTeam, members: mockMembers });
    });

    it('should return 404 if team not found', async () => {
      (TeamModel.findById as jest.Mock).mockResolvedValue(null);

      await TeamController.getTeam(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(true);
      (TeamModel.update as jest.Mock).mockResolvedValue(mockTeam);

      await TeamController.updateTeam(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
      expect(TeamModel.update).toHaveBeenCalledWith(1, {
        name: 'Updated Team',
        description: 'Updated Description',
      });
      expect(responseObject).toEqual({
        message: 'Team updated successfully',
        team: mockTeam
      });
    });

    it('should return 403 if user is not admin', async () => {
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(false);

      await TeamController.updateTeam(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(true);
      (TeamModel.delete as jest.Mock).mockResolvedValue(undefined);

      await TeamController.deleteTeam(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
      expect(TeamModel.delete).toHaveBeenCalledWith(1);
      expect(responseObject).toHaveProperty('message', 'Team deleted successfully');
    });

    it('should return 403 if user is not admin', async () => {
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(false);

      await TeamController.deleteTeam(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(true);
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (TeamModel.addMember as jest.Mock).mockResolvedValue({
        id: 1,
        team_id: 1,
        user_id: 2,
        role: 'member',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await TeamController.addMember(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
      expect(UserModel.findByEmail).toHaveBeenCalledWith('newmember@example.com');
      expect(TeamModel.addMember).toHaveBeenCalledWith(1, 2, 'member');
      expect(responseObject).toHaveProperty('message', 'Member added successfully');
    });

    it('should return 403 if user is not admin', async () => {
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(false);

      await TeamController.addMember(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toHaveProperty('message', 'Only team admins can add members');
    });

    it('should return 404 if user not found', async () => {
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(true);
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await TeamController.addMember(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(true);
      (TeamModel.removeMember as jest.Mock).mockResolvedValue(undefined);

      await TeamController.removeMember(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.isTeamAdmin).toHaveBeenCalledWith(1, 1);
      expect(TeamModel.removeMember).toHaveBeenCalledWith(1, 2);
      expect(responseObject).toHaveProperty('message', 'Member removed successfully');
    });

    it('should return 403 if user is not admin', async () => {
      (TeamModel.isTeamAdmin as jest.Mock).mockResolvedValue(false);

      await TeamController.removeMember(mockRequest as Request, mockResponse as Response);

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
      (TeamModel.getUserTeams as jest.Mock).mockResolvedValue(mockTeams);

      await TeamController.getUserTeams(mockRequest as Request, mockResponse as Response);

      expect(TeamModel.getUserTeams).toHaveBeenCalledWith(1);
      expect(responseObject).toEqual(mockTeams);
    });
  });
}); 