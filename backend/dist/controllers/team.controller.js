"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
class TeamController {
    static async createTeam(req, res) {
        try {
            const { name, description } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ message: 'Team name is required' });
            }
            const team = await team_model_1.TeamModel.create({
                name,
                description,
                created_by: user.id
            });
            await team_model_1.TeamModel.addMember(team.id, user.id, 'admin');
            res.status(201).json({
                message: 'Team created successfully',
                team
            });
        }
        catch (error) {
            console.error('Error creating team:', error);
            res.status(500).json({ message: 'Error creating team' });
        }
    }
    static async getTeam(req, res) {
        try {
            const { id } = req.params;
            const teamId = parseInt(id);
            const team = await team_model_1.TeamModel.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const members = await team_model_1.TeamModel.getTeamMembers(teamId);
            res.json({ ...team, members });
        }
        catch (error) {
            console.error('Error getting team:', error);
            res.status(500).json({ message: 'Error getting team' });
        }
    }
    static async updateTeam(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const user = req.user;
            const teamId = parseInt(id);
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const isAdmin = await team_model_1.TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can update team details' });
            }
            const team = await team_model_1.TeamModel.update(teamId, { name, description });
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            res.json({
                message: 'Team updated successfully',
                team
            });
        }
        catch (error) {
            console.error('Error updating team:', error);
            res.status(500).json({ message: 'Error updating team' });
        }
    }
    static async deleteTeam(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const teamId = parseInt(id);
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const isAdmin = await team_model_1.TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can delete teams' });
            }
            await team_model_1.TeamModel.delete(teamId);
            res.json({ message: 'Team deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting team:', error);
            res.status(500).json({ message: 'Error deleting team' });
        }
    }
    static async addMember(req, res) {
        try {
            const { id } = req.params;
            const { email, role } = req.body;
            const user = req.user;
            const teamId = parseInt(id);
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const isAdmin = await team_model_1.TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can add members' });
            }
            const newMember = await user_model_1.UserModel.findByEmail(email);
            if (!newMember || !newMember.id) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMember = await team_model_1.TeamModel.isTeamMember(teamId, newMember.id);
            if (isMember) {
                return res.status(400).json({ message: 'User is already a member of this team' });
            }
            const member = await team_model_1.TeamModel.addMember(teamId, newMember.id, role);
            res.status(201).json({
                message: 'Member added successfully',
                member
            });
        }
        catch (error) {
            console.error('Error adding member:', error);
            res.status(500).json({ message: 'Error adding member' });
        }
    }
    static async removeMember(req, res) {
        try {
            const { id, memberId } = req.params;
            const user = req.user;
            const teamId = parseInt(id);
            const targetMemberId = parseInt(memberId);
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const isAdmin = await team_model_1.TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can remove members' });
            }
            // Check if trying to remove the last admin
            const members = await team_model_1.TeamModel.getTeamMembers(teamId);
            const adminCount = members.filter(m => m.role === 'admin').length;
            const targetMember = members.find(m => m.id === targetMemberId);
            if (adminCount === 1 && targetMember?.role === 'admin') {
                return res.status(400).json({ message: 'Cannot remove the last admin' });
            }
            await team_model_1.TeamModel.removeMember(teamId, targetMemberId);
            res.json({ message: 'Member removed successfully' });
        }
        catch (error) {
            console.error('Error removing member:', error);
            res.status(500).json({ message: 'Error removing member' });
        }
    }
    static async updateMemberRole(req, res) {
        try {
            const { id, memberId } = req.params;
            const { role } = req.body;
            const user = req.user;
            const teamId = parseInt(id);
            const targetMemberId = parseInt(memberId);
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const isAdmin = await team_model_1.TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can update member roles' });
            }
            // Check if trying to change the last admin's role
            const members = await team_model_1.TeamModel.getTeamMembers(teamId);
            const adminCount = members.filter(m => m.role === 'admin').length;
            const targetMember = members.find(m => m.id === targetMemberId);
            if (adminCount === 1 && targetMember?.role === 'admin' && role !== 'admin') {
                return res.status(400).json({ message: 'Cannot change the last admin\'s role' });
            }
            await team_model_1.TeamModel.updateMemberRole(teamId, targetMemberId, role);
            res.json({
                message: 'Member role updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating member role:', error);
            res.status(500).json({ message: 'Error updating member role' });
        }
    }
    static async getUserTeams(req, res) {
        try {
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const teams = await team_model_1.TeamModel.getUserTeams(user.id);
            res.json(teams);
        }
        catch (error) {
            console.error('Error getting user teams:', error);
            res.status(500).json({ message: 'Error getting user teams' });
        }
    }
}
exports.TeamController = TeamController;
