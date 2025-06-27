"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const team_model_1 = require("../../models/team.model");
const database_1 = require("../../config/database");
// Mock the database pool
jest.mock('../../config/database', () => ({
    pool: {
        execute: jest.fn(),
    },
}));
const mockedPool = database_1.pool;
describe('TeamModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a team successfully', async () => {
            const teamData = {
                name: 'Test Team',
                description: 'A test team',
                created_by: 1
            };
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                description: 'A test team',
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockedPool.execute
                .mockResolvedValueOnce([{ insertId: 1 }])
                .mockResolvedValueOnce([[mockTeam]]);
            const result = await team_model_1.TeamModel.create(teamData);
            expect(mockedPool.execute).toHaveBeenCalledWith('INSERT INTO TEAMS (name, description, created_by) VALUES (?, ?, ?)', [teamData.name, teamData.description, teamData.created_by]);
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
            const mockResult = [[mockTeam]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.findById(1);
            expect(mockedPool.execute).toHaveBeenCalledWith('SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?', [1]);
            expect(result).toEqual(mockTeam);
        });
        it('should return null if team not found', async () => {
            const mockResult = [[]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.findById(999);
            expect(result).toBeNull();
        });
    });
    describe('getUserTeams', () => {
        it('should get teams for a user', async () => {
            const mockTeams = [
                {
                    id: 1,
                    name: 'Team 1',
                    description: 'Team 1 description',
                    created_by: 1,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 2,
                    name: 'Team 2',
                    description: 'Team 2 description',
                    created_by: 1,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];
            const mockResult = [mockTeams];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.getUserTeams(1);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('SELECT t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('FROM TEAMS t'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('JOIN TEAM_MEMBERS tm ON t.id = tm.team_id'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('WHERE tm.user_id = ?'), [1]);
            expect(result).toEqual(mockTeams);
        });
    });
    describe('update', () => {
        it('should update a team successfully', async () => {
            const updateData = {
                name: 'Updated Team',
                description: 'Updated description'
            };
            const mockTeam = {
                id: 1,
                ...updateData,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockedPool.execute
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([[mockTeam]]);
            const result = await team_model_1.TeamModel.update(1, updateData);
            expect(mockedPool.execute).toHaveBeenCalledWith('UPDATE TEAMS SET name = ?, description = ? WHERE id = ?', [updateData.name, updateData.description, 1]);
            expect(result).toEqual(mockTeam);
        });
    });
    describe('delete', () => {
        it('should delete a team successfully', async () => {
            const mockResult = [{ affectedRows: 1 }];
            mockedPool.execute.mockResolvedValue(mockResult);
            await team_model_1.TeamModel.delete(1);
            expect(mockedPool.execute).toHaveBeenCalledWith('DELETE FROM TEAMS WHERE id = ?', [1]);
        });
    });
    describe('addMember', () => {
        it('should add a member to a team', async () => {
            const mockMember = {
                id: 1,
                team_id: 1,
                user_id: 2,
                role: 'player',
                created_at: new Date(),
                updated_at: new Date()
            };
            mockedPool.execute.mockResolvedValue([[mockMember]]);
            const result = await team_model_1.TeamModel.addMember(1, 2, 'player');
            expect(mockedPool.execute).toHaveBeenCalledWith('INSERT INTO TEAM_MEMBERS (team_id, user_id, role) VALUES (?, ?, ?)', [1, 2, 'player']);
            expect(result).toEqual(mockMember);
        });
    });
    describe('removeMember', () => {
        it('should remove a member from a team', async () => {
            const mockResult = [{ affectedRows: 1 }];
            mockedPool.execute.mockResolvedValue(mockResult);
            await team_model_1.TeamModel.removeMember(1, 2);
            expect(mockedPool.execute).toHaveBeenCalledWith('DELETE FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?', [1, 2]);
        });
    });
    describe('getTeamMembers', () => {
        it('should get team members with user information', async () => {
            const mockMembers = [
                {
                    id: 1,
                    team_id: 1,
                    user_id: 1,
                    role: 'admin',
                    created_at: new Date(),
                    updated_at: new Date(),
                    username: 'testuser',
                    email: 'test@example.com',
                    profile_picture_url: null
                }
            ];
            const mockResult = [mockMembers];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.getTeamMembers(1);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.created_at, tm.updated_at'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('u.username, u.email, u.profile_picture_url'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('FROM TEAM_MEMBERS tm'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('JOIN USERS u ON tm.user_id = u.id'), [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(expect.stringContaining('WHERE tm.team_id = ?'), [1]);
            expect(result).toEqual(mockMembers);
        });
    });
    describe('isTeamAdmin', () => {
        it('should return true if user is team admin', async () => {
            const mockResult = [[{ '1': 1 }]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.isTeamAdmin(1, 1);
            expect(mockedPool.execute).toHaveBeenCalledWith('SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ? AND role = "admin"', [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false if user is not team admin', async () => {
            const mockResult = [[]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.isTeamAdmin(1, 1);
            expect(result).toBe(false);
        });
    });
    describe('isTeamMember', () => {
        it('should return true if user is team member', async () => {
            const mockResult = [[{ '1': 1 }]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.isTeamMember(1, 1);
            expect(mockedPool.execute).toHaveBeenCalledWith('SELECT 1 FROM TEAM_MEMBERS WHERE team_id = ? AND user_id = ?', [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false if user is not team member', async () => {
            const mockResult = [[]];
            mockedPool.execute.mockResolvedValue(mockResult);
            const result = await team_model_1.TeamModel.isTeamMember(1, 1);
            expect(result).toBe(false);
        });
    });
    describe('getTeamStats', () => {
        it('should return team statistics', async () => {
            const mockMemberRows = [
                { role: 'admin', created_at: new Date() },
                { role: 'player', created_at: new Date() },
                { role: 'captain', created_at: new Date() }
            ];
            const mockTeamRows = [
                { created_at: new Date(), updated_at: new Date() }
            ];
            mockedPool.execute
                .mockResolvedValueOnce([mockMemberRows])
                .mockResolvedValueOnce([mockTeamRows]);
            const result = await team_model_1.TeamModel.getTeamStats(1);
            expect(mockedPool.execute).toHaveBeenCalledWith(`SELECT role, created_at FROM TEAM_MEMBERS WHERE team_id = ?`, [1]);
            expect(mockedPool.execute).toHaveBeenCalledWith(`SELECT created_at, updated_at FROM TEAMS WHERE id = ?`, [1]);
            expect(result).toHaveProperty('totalMembers');
            expect(result).toHaveProperty('admins');
            expect(result).toHaveProperty('captains');
            expect(result).toHaveProperty('players');
            expect(result).toHaveProperty('snackProviders');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('lastActivity');
        });
    });
});
