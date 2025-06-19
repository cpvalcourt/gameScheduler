import { Request, Response } from 'express';
import { TeamModel } from '../models/team.model';
import { UserModel } from '../models/user.model';

export class TeamController {
    static async createTeam(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            const user = req.user;

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ message: 'Team name is required' });
            }

            const team = await TeamModel.create({
                name,
                description,
                created_by: user.id
            });

            await TeamModel.addMember(team.id, user.id, 'admin');

            res.status(201).json({
                message: 'Team created successfully',
                team
            });
        } catch (error) {
            console.error('Error creating team:', error);
            res.status(500).json({ message: 'Error creating team' });
        }
    }

    static async getTeam(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const teamId = parseInt(id);

            const team = await TeamModel.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            const members = await TeamModel.getTeamMembers(teamId);
            res.json({ ...team, members });
        } catch (error) {
            console.error('Error getting team:', error);
            res.status(500).json({ message: 'Error getting team' });
        }
    }

    static async updateTeam(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const user = req.user;
            const teamId = parseInt(id);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isAdmin = await TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can update team details' });
            }

            const team = await TeamModel.update(teamId, { name, description });
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            res.json({
                message: 'Team updated successfully',
                team
            });
        } catch (error) {
            console.error('Error updating team:', error);
            res.status(500).json({ message: 'Error updating team' });
        }
    }

    static async deleteTeam(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = req.user;
            const teamId = parseInt(id);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isAdmin = await TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can delete teams' });
            }

            await TeamModel.delete(teamId);
            res.json({ message: 'Team deleted successfully' });
        } catch (error) {
            console.error('Error deleting team:', error);
            res.status(500).json({ message: 'Error deleting team' });
        }
    }

    static async addMember(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, role } = req.body;
            const user = req.user;
            const teamId = parseInt(id);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isAdmin = await TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can add members' });
            }

            const newMember = await UserModel.findByEmail(email);
            if (!newMember || !newMember.id) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMember = await TeamModel.isTeamMember(teamId, newMember.id);
            if (isMember) {
                return res.status(400).json({ message: 'User is already a member of this team' });
            }

            const member = await TeamModel.addMember(teamId, newMember.id, role);
            res.status(201).json({
                message: 'Member added successfully',
                member
            });
        } catch (error) {
            console.error('Error adding member:', error);
            res.status(500).json({ message: 'Error adding member' });
        }
    }

    static async removeMember(req: Request, res: Response) {
        try {
            const { id, memberId } = req.params;
            const user = req.user;
            const teamId = parseInt(id);
            const targetMemberId = parseInt(memberId);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isAdmin = await TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can remove members' });
            }

            // Check if trying to remove the last admin
            const members = await TeamModel.getTeamMembers(teamId);
            const adminCount = members.filter(m => m.role === 'admin').length;
            const targetMember = members.find(m => m.id === targetMemberId);

            if (adminCount === 1 && targetMember?.role === 'admin') {
                return res.status(400).json({ message: 'Cannot remove the last admin' });
            }

            await TeamModel.removeMember(teamId, targetMemberId);
            res.json({ message: 'Member removed successfully' });
        } catch (error) {
            console.error('Error removing member:', error);
            res.status(500).json({ message: 'Error removing member' });
        }
    }

    static async updateMemberRole(req: Request, res: Response) {
        try {
            const { id, memberId } = req.params;
            const { role } = req.body;
            const user = req.user;
            const teamId = parseInt(id);
            const targetMemberId = parseInt(memberId);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isAdmin = await TeamModel.isTeamAdmin(teamId, user.id);
            if (!isAdmin) {
                return res.status(403).json({ message: 'Only team admins can update member roles' });
            }

            // Check if trying to change the last admin's role
            const members = await TeamModel.getTeamMembers(teamId);
            const adminCount = members.filter(m => m.role === 'admin').length;
            const targetMember = members.find(m => m.id === targetMemberId);

            if (adminCount === 1 && targetMember?.role === 'admin' && role !== 'admin') {
                return res.status(400).json({ message: 'Cannot change the last admin\'s role' });
            }

            await TeamModel.updateMemberRole(teamId, targetMemberId, role);
            res.json({
                message: 'Member role updated successfully'
            });
        } catch (error) {
            console.error('Error updating member role:', error);
            res.status(500).json({ message: 'Error updating member role' });
        }
    }

    static async getUserTeams(req: Request, res: Response) {
        try {
            const user = req.user;

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const teams = await TeamModel.getUserTeams(user.id);
            res.json(teams);
        } catch (error) {
            console.error('Error getting user teams:', error);
            res.status(500).json({ message: 'Error getting user teams' });
        }
    }
} 