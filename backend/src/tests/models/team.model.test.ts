import { TeamModel } from '../../models/team.model';
import { pool } from '../../config/database';

jest.mock('../../config/database', () => ({
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn()
  }
}));

describe('TeamModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const mockTeam = {
        id: 1,
        name: 'Test Team',
        description: 'A test team',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockTeam]]);

      const result = await TeamModel.create({
        name: 'Test Team',
        description: 'A test team',
        created_by: 1
      });

      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTeam);
    });
  });

  describe('findById', () => {
    it('should find a team by id', async () => {
      const mockTeam = {
        id: 1,
        name: 'Test Team',
        description: 'A test team',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockTeam]]);

      const result = await TeamModel.findById(1);
      expect(pool.execute).toHaveBeenCalledWith('SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?', [1]);
      expect(result).toEqual(mockTeam);
    });
    it('should return null if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await TeamModel.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const mockTeam = {
        id: 1,
        name: 'Updated Team',
        description: 'Updated desc',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[mockTeam]]);
      const result = await TeamModel.update(1, { name: 'Updated Team', description: 'Updated desc' });
      expect(pool.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTeam);
    });
    it('should return null if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await TeamModel.update(999, { name: 'Updated Team' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a team', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]); // TEAM_MEMBERS
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]); // TEAMS
      await expect(TeamModel.delete(1)).resolves.toBeUndefined();
      expect(pool.execute).toHaveBeenNthCalledWith(1, 'DELETE FROM TEAM_MEMBERS WHERE team_id = ?', [1]);
      expect(pool.execute).toHaveBeenNthCalledWith(2, 'DELETE FROM TEAMS WHERE id = ?', [1]);
    });
    it('should return void if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]); // TEAM_MEMBERS
      (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]); // TEAMS
      await expect(TeamModel.delete(999)).resolves.toBeUndefined();
    });
  });

  describe('getUserTeams', () => {
    it('should get all teams for a user', async () => {
      const mockTeams = [
        {
          id: 1,
          name: 'Test Team',
          description: 'A test team',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      (pool.execute as jest.Mock).mockResolvedValueOnce([mockTeams]);
      const result = await TeamModel.getUserTeams(1);
      expect(pool.execute).toHaveBeenCalledWith(
        `SELECT t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at\n             FROM TEAMS t\n             JOIN TEAM_MEMBERS tm ON t.id = tm.team_id\n             WHERE tm.user_id = ?`,
        [1]
      );
      expect(result).toEqual(mockTeams);
    });
  });

  describe('member management', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('addMember', () => {
      it('should add a member to a team', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 1 }]);
        (pool.execute as jest.Mock).mockResolvedValueOnce([[{ id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }]]);
        const result = await TeamModel.addMember(1, 2, 'player');
        expect(result).toEqual({
          id: 1,
          team_id: 1,
          user_id: 2,
          role: 'player',
          created_at: '2023-10-01T14:00:00Z',
          updated_at: '2023-10-01T14:00:00Z'
        });
      });
    });

    describe('removeMember', () => {
      it('should remove a member from a team', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
        const result = await TeamModel.removeMember(1, 2);
        expect(result).toBeUndefined();
      });
      it('should return void if member not found', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
        const result = await TeamModel.removeMember(1, 999);
        expect(result).toBeUndefined();
      });
    });

    describe('getTeamMembers', () => {
      it('should return all members of a team', async () => {
        const mockMembers = [
          { id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' },
          { id: 2, team_id: 1, user_id: 3, role: 'admin', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }
        ];
        (pool.execute as jest.Mock).mockResolvedValueOnce([mockMembers]);
        const result = await TeamModel.getTeamMembers(1);
        expect(result).toEqual([
          { id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' },
          { id: 2, team_id: 1, user_id: 3, role: 'admin', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }
        ]);
      });
    });

    describe('isTeamMember', () => {
      it('should return true if user is a team member', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([[{ ID: 1 }]]);
        const result = await TeamModel.isTeamMember(1, 2);
        expect(result).toBe(true);
      });
      it('should return false if user is not a team member', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
        const result = await TeamModel.isTeamMember(1, 999);
        expect(result).toBe(false);
      });
    });

    describe('isTeamAdmin', () => {
      it('should return true if user is a team admin', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([[{ ID: 1 }]]);
        const result = await TeamModel.isTeamAdmin(1, 2);
        expect(result).toBe(true);
      });
      it('should return false if user is not a team admin', async () => {
        (pool.execute as jest.Mock).mockResolvedValueOnce([[]]);
        const result = await TeamModel.isTeamAdmin(1, 999);
        expect(result).toBe(false);
      });
    });
  });
}); 