"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const team_model_1 = require("../../models/team.model");
const database_1 = require("../../config/database");
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
            database_1.pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[mockTeam]]);
            const result = await team_model_1.TeamModel.create({
                name: 'Test Team',
                description: 'A test team',
                created_by: 1
            });
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
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
            database_1.pool.execute.mockResolvedValueOnce([[mockTeam]]);
            const result = await team_model_1.TeamModel.findById(1);
            expect(database_1.pool.execute).toHaveBeenCalledWith('SELECT id, name, description, created_by, created_at, updated_at FROM TEAMS WHERE id = ?', [1]);
            expect(result).toEqual(mockTeam);
        });
        it('should return null if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await team_model_1.TeamModel.findById(999);
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
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            database_1.pool.execute.mockResolvedValueOnce([[mockTeam]]);
            const result = await team_model_1.TeamModel.update(1, { name: 'Updated Team', description: 'Updated desc' });
            expect(database_1.pool.execute).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockTeam);
        });
        it('should return null if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            database_1.pool.execute.mockResolvedValueOnce([[]]);
            const result = await team_model_1.TeamModel.update(999, { name: 'Updated Team' });
            expect(result).toBeNull();
        });
    });
    describe('delete', () => {
        it('should delete a team', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); // TEAM_MEMBERS
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); // TEAMS
            await expect(team_model_1.TeamModel.delete(1)).resolves.toBeUndefined();
            expect(database_1.pool.execute).toHaveBeenNthCalledWith(1, 'DELETE FROM TEAM_MEMBERS WHERE team_id = ?', [1]);
            expect(database_1.pool.execute).toHaveBeenNthCalledWith(2, 'DELETE FROM TEAMS WHERE id = ?', [1]);
        });
        it('should return void if not found', async () => {
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]); // TEAM_MEMBERS
            database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]); // TEAMS
            await expect(team_model_1.TeamModel.delete(999)).resolves.toBeUndefined();
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
            database_1.pool.execute.mockResolvedValueOnce([mockTeams]);
            const result = await team_model_1.TeamModel.getUserTeams(1);
            expect(database_1.pool.execute).toHaveBeenCalledWith(`SELECT t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at\n             FROM TEAMS t\n             JOIN TEAM_MEMBERS tm ON t.id = tm.team_id\n             WHERE tm.user_id = ?`, [1]);
            expect(result).toEqual(mockTeams);
        });
    });
    describe('member management', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        describe('addMember', () => {
            it('should add a member to a team', async () => {
                database_1.pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);
                database_1.pool.execute.mockResolvedValueOnce([[{ id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }]]);
                const result = await team_model_1.TeamModel.addMember(1, 2, 'player');
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
                database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
                const result = await team_model_1.TeamModel.removeMember(1, 2);
                expect(result).toBeUndefined();
            });
            it('should return void if member not found', async () => {
                database_1.pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
                const result = await team_model_1.TeamModel.removeMember(1, 999);
                expect(result).toBeUndefined();
            });
        });
        describe('getTeamMembers', () => {
            it('should return all members of a team', async () => {
                const mockMembers = [
                    { id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' },
                    { id: 2, team_id: 1, user_id: 3, role: 'admin', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }
                ];
                database_1.pool.execute.mockResolvedValueOnce([mockMembers]);
                const result = await team_model_1.TeamModel.getTeamMembers(1);
                expect(result).toEqual([
                    { id: 1, team_id: 1, user_id: 2, role: 'player', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' },
                    { id: 2, team_id: 1, user_id: 3, role: 'admin', created_at: '2023-10-01T14:00:00Z', updated_at: '2023-10-01T14:00:00Z' }
                ]);
            });
        });
        describe('isTeamMember', () => {
            it('should return true if user is a team member', async () => {
                database_1.pool.execute.mockResolvedValueOnce([[{ ID: 1 }]]);
                const result = await team_model_1.TeamModel.isTeamMember(1, 2);
                expect(result).toBe(true);
            });
            it('should return false if user is not a team member', async () => {
                database_1.pool.execute.mockResolvedValueOnce([[]]);
                const result = await team_model_1.TeamModel.isTeamMember(1, 999);
                expect(result).toBe(false);
            });
        });
        describe('isTeamAdmin', () => {
            it('should return true if user is a team admin', async () => {
                database_1.pool.execute.mockResolvedValueOnce([[{ ID: 1 }]]);
                const result = await team_model_1.TeamModel.isTeamAdmin(1, 2);
                expect(result).toBe(true);
            });
            it('should return false if user is not a team admin', async () => {
                database_1.pool.execute.mockResolvedValueOnce([[]]);
                const result = await team_model_1.TeamModel.isTeamAdmin(1, 999);
                expect(result).toBe(false);
            });
        });
    });
});
