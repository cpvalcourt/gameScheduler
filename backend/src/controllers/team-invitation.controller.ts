import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TeamInvitationModel } from '../models/team-invitation.model';
import { TeamModel } from '../models/team.model';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/app-error';

export class TeamInvitationController {
    static async sendInvitation(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.array() 
                });
            }

            const { teamId, email, role } = req.body;
            const userId = (req as any).user.id;

            // Check if user is a captain of the team
            const team = await TeamModel.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can send invitations' });
            }

            // Check if user is already a member of the team
            const isMember = await TeamModel.isTeamMember(teamId, userId);
            if (isMember) {
                return res.status(400).json({ message: 'User is already a member of this team' });
            }

            // Check if invitation already exists
            const isInvited = await TeamInvitationModel.isUserInvitedToTeam(email, teamId);
            if (isInvited) {
                return res.status(400).json({ message: 'User has already been invited to this team' });
            }

            // Create invitation
            const invitation = await TeamInvitationModel.create(teamId, userId, email, role);

            // TODO: Send email notification here
            console.log(`Invitation email sent to ${email}`);

            res.status(201).json({
                message: 'Invitation sent successfully',
                invitation: {
                    id: invitation.id,
                    team_id: invitation.team_id,
                    invited_email: invitation.invited_email,
                    invited_role: invitation.invited_role,
                    status: invitation.status,
                    expires_at: invitation.expires_at
                }
            });
        } catch (error) {
            console.error('Error sending invitation:', error);
            res.status(500).json({ 
                message: 'Error sending invitation', 
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }

    static async getTeamInvitations(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const userId = (req as any).user.id;

            // Check if user is a captain of the team
            const team = await TeamModel.findById(parseInt(teamId));
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can view team invitations' });
            }

            const invitations = await TeamInvitationModel.findByTeam(parseInt(teamId));

            res.json({
                invitations: invitations.map(inv => ({
                    id: inv.id,
                    invited_email: inv.invited_email,
                    invited_role: inv.invited_role,
                    status: inv.status,
                    expires_at: inv.expires_at,
                    created_at: inv.created_at,
                    invited_by_username: inv.invited_by_username
                }))
            });
        } catch (error) {
            console.error('Error getting team invitations:', error);
            res.status(500).json({ 
                message: 'Error getting team invitations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getMyInvitations(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const invitations = await TeamInvitationModel.findByEmail(user.email);

            res.json({
                invitations: invitations.map(inv => ({
                    id: inv.id,
                    team_id: inv.team_id,
                    team_name: inv.team_name,
                    invited_role: inv.invited_role,
                    status: inv.status,
                    expires_at: inv.expires_at,
                    created_at: inv.created_at,
                    invited_by_username: inv.invited_by_username
                }))
            });
        } catch (error) {
            console.error('Error getting my invitations:', error);
            res.status(500).json({ 
                message: 'Error getting invitations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async acceptInvitation(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.array() 
                });
            }

            const { token } = req.params;
            const userId = (req as any).user.id;

            const invitation = await TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            if (invitation.status !== 'pending') {
                return res.status(400).json({ message: 'Invitation is no longer valid' });
            }

            if (invitation.expires_at < new Date()) {
                await TeamInvitationModel.updateStatus(token, 'expired');
                return res.status(400).json({ message: 'Invitation has expired' });
            }

            // Check if user is the one invited
            const user = await UserModel.findById(userId);
            if (!user || user.email !== invitation.invited_email) {
                return res.status(403).json({ message: 'You are not authorized to accept this invitation' });
            }

            // Add user to team
            await TeamModel.addMember(invitation.team_id, userId, invitation.invited_role);

            // Update invitation status
            await TeamInvitationModel.updateStatus(token, 'accepted');

            res.json({ message: 'Invitation accepted successfully' });
        } catch (error) {
            console.error('Error accepting invitation:', error);
            res.status(500).json({ 
                message: 'Error accepting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async declineInvitation(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.array() 
                });
            }

            const { token } = req.params;
            const userId = (req as any).user.id;

            const invitation = await TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            if (invitation.status !== 'pending') {
                return res.status(400).json({ message: 'Invitation is no longer valid' });
            }

            // Check if user is the one invited
            const user = await UserModel.findById(userId);
            if (!user || user.email !== invitation.invited_email) {
                return res.status(403).json({ message: 'You are not authorized to decline this invitation' });
            }

            // Update invitation status
            await TeamInvitationModel.updateStatus(token, 'declined');

            res.json({ message: 'Invitation declined successfully' });
        } catch (error) {
            console.error('Error declining invitation:', error);
            res.status(500).json({ 
                message: 'Error declining invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteInvitation(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.array() 
                });
            }

            const { teamId, invitationId } = req.params;
            const userId = (req as any).user.id;

            // Check if user is a captain of the team
            const team = await TeamModel.findById(parseInt(teamId));
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can delete invitations' });
            }

            // Delete invitation
            await TeamInvitationModel.deleteInvitation(parseInt(invitationId));

            res.json({ message: 'Invitation deleted successfully' });
        } catch (error) {
            console.error('Error deleting invitation:', error);
            res.status(500).json({ 
                message: 'Error deleting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 