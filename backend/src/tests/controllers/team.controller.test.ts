import { Request, Response } from 'express';
import { TeamController } from '../../controllers/team.controller';
import { TeamModel } from '../../models/team.model';
import { UserModel } from '../../models/user.model';

// Mock the models
jest.mock('../../models/team.model');
jest.mock('../../models/user.model');

const mockedTeamModel = TeamModel as jest.Mocked<typeof TeamModel>;
const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('TeamController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

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
      const mockUser = { id: 1, email: 'test@example.com' };
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
      mockedTeamModel.addMember.mockResolvedValue({} as any);

      await TeamController.createTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.message).toBe('Team created successfully');
      expect(responseObject.team).toEqual(mockTeam);
    });

    it('should return 400 if team name is missing', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      mockRequest = {
        body: { description: 'A test team' },
        user: mockUser
      };

      await TeamController.createTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.message).toBe('Team name is required');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest = {
        body: { name: 'Test Team', description: 'A test team' },
        user: undefined
      };

      await TeamController.createTeam(mockRequest as Request, mockResponse as Response);

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
          role: 'admin' as const,
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

      await TeamController.getTeam(mockRequest as Request, mockResponse as Response);

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

      await TeamController.getTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.message).toBe('Team not found');
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
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

      await TeamController.updateTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Team updated successfully',
        team: mockTeam
      });
    });

    it('should return 403 if user is not team admin', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      mockRequest = {
        params: { id: '1' },
        body: { name: 'Updated Team' },
        user: mockUser
      };

      mockedTeamModel.isTeamAdmin.mockResolvedValue(false);

      await TeamController.updateTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject.message).toBe('Only team admins can update team details');
    });
  });

  describe('deleteTeam', () => {
    it('should delete team successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      mockRequest = {
        params: { id: '1' },
        user: mockUser
      };

      mockedTeamModel.isTeamAdmin.mockResolvedValue(true);
      mockedTeamModel.delete.mockResolvedValue();

      await TeamController.deleteTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Team deleted successfully'
      });
    });

    it('should return 403 if user is not team admin', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      mockRequest = {
        params: { id: '1' },
        user: mockUser
      };

      mockedTeamModel.isTeamAdmin.mockResolvedValue(false);

      await TeamController.deleteTeam(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject.message).toBe('Only team admins can delete teams');
    });
  });

  describe('getUserTeams', () => {
    it('should return user teams successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
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

      await TeamController.getUserTeams(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockTeams);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest = {
        user: undefined
      };

      await TeamController.getUserTeams(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.message).toBe('User not authenticated');
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
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

      await TeamController.getTeamStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
    });

    it('should return 403 if user is not team member', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      mockRequest = {
        params: { id: '1' },
        user: mockUser
      };

      mockedTeamModel.isTeamMember.mockResolvedValue(false);

      await TeamController.getTeamStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject.message).toBe('Not authorized to view this team');
    });
  });
}); 