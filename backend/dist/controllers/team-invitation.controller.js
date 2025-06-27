"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamInvitationController = void 0;
const express_validator_1 = require("express-validator");
const team_invitation_model_1 = require("../models/team-invitation.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
const team_invitation_service_1 = require("../services/team-invitation.service");
class TeamInvitationController {
    static async sendInvitation(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { teamId, email, role } = req.body;
            const userId = req.user.id;
            // Check if user is a captain of the team
            const team = await team_model_1.TeamModel.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can send invitations' });
            }
            // Check if user is already a member of the team
            const invitedUser = await user_model_1.UserModel.findByEmail(email);
            if (invitedUser) {
                const isMember = await team_model_1.TeamModel.isTeamMember(teamId, invitedUser.id);
                if (isMember) {
                    return res.status(400).json({ message: 'User is already a member of this team' });
                }
            }
            // Check if invitation already exists
            const isInvited = await team_invitation_model_1.TeamInvitationModel.isUserInvitedToTeam(email, teamId);
            if (isInvited) {
                return res.status(400).json({ message: 'User has already been invited to this team' });
            }
            // Create invitation
            const invitation = await team_invitation_model_1.TeamInvitationModel.create(teamId, userId, email, role);
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
        }
        catch (error) {
            console.error('Error sending invitation:', error);
            res.status(500).json({
                message: 'Error sending invitation',
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }
    static async getTeamInvitations(req, res) {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;
            // Check if user is a captain of the team
            const team = await team_model_1.TeamModel.findById(parseInt(teamId));
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can view team invitations' });
            }
            const invitations = await team_invitation_model_1.TeamInvitationModel.findByTeam(parseInt(teamId));
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
        }
        catch (error) {
            console.error('Error getting team invitations:', error);
            res.status(500).json({
                message: 'Error getting team invitations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getMyInvitations(req, res) {
        try {
            const userId = req.user.id;
            const user = await user_model_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const invitations = await team_invitation_model_1.TeamInvitationModel.findByEmail(user.email);
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
        }
        catch (error) {
            console.error('Error getting my invitations:', error);
            res.status(500).json({
                message: 'Error getting invitations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async acceptInvitation(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { token } = req.params;
            const userId = req.user.id;
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }
            if (invitation.status !== 'pending') {
                return res.status(400).json({ message: 'Invitation is no longer valid' });
            }
            if (invitation.expires_at < new Date()) {
                await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'expired');
                return res.status(400).json({ message: 'Invitation has expired' });
            }
            // Check if user is the one invited
            const user = await user_model_1.UserModel.findById(userId);
            if (!user || user.email !== invitation.invited_email) {
                return res.status(403).json({ message: 'You are not authorized to accept this invitation' });
            }
            // Add user to team
            await team_model_1.TeamModel.addMember(invitation.team_id, userId, invitation.invited_role);
            // Update invitation status
            await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'accepted');
            res.json({ message: 'Invitation accepted successfully' });
        }
        catch (error) {
            console.error('Error accepting invitation:', error);
            res.status(500).json({
                message: 'Error accepting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async declineInvitation(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { token } = req.params;
            const userId = req.user.id;
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }
            if (invitation.status !== 'pending') {
                return res.status(400).json({ message: 'Invitation is no longer valid' });
            }
            // Check if user is the one invited
            const user = await user_model_1.UserModel.findById(userId);
            if (!user || user.email !== invitation.invited_email) {
                return res.status(403).json({ message: 'You are not authorized to decline this invitation' });
            }
            // Update invitation status
            await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'declined');
            res.json({ message: 'Invitation declined successfully' });
        }
        catch (error) {
            console.error('Error declining invitation:', error);
            res.status(500).json({
                message: 'Error declining invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async deleteInvitation(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { teamId, invitationId } = req.params;
            const userId = req.user.id;
            // Check if user is a captain of the team
            const team = await team_model_1.TeamModel.findById(parseInt(teamId));
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            if (team.created_by !== userId) {
                return res.status(403).json({ message: 'Only team captains can delete invitations' });
            }
            // Delete invitation
            await team_invitation_model_1.TeamInvitationModel.deleteInvitation(parseInt(invitationId));
            res.json({ message: 'Invitation deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting invitation:', error);
            res.status(500).json({
                message: 'Error deleting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getInvitationByToken(req, res) {
        try {
            const { token } = req.params;
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }
            if (invitation.status !== 'pending') {
                return res.status(400).json({ message: 'Invitation is no longer valid' });
            }
            if (invitation.expires_at < new Date()) {
                await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'expired');
                return res.status(400).json({ message: 'Invitation has expired' });
            }
            res.json({
                invitation: {
                    id: invitation.id,
                    team_id: invitation.team_id,
                    team_name: invitation.team_name,
                    invited_email: invitation.invited_email,
                    invited_role: invitation.invited_role,
                    status: invitation.status,
                    expires_at: invitation.expires_at,
                    created_at: invitation.created_at,
                    invited_by_username: invitation.invited_by_username
                }
            });
        }
        catch (error) {
            console.error('Error getting invitation by token:', error);
            res.status(500).json({
                message: 'Error getting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async acceptInvitationWithService(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { token } = req.params;
            const userId = req.user.id;
            const result = await team_invitation_service_1.TeamInvitationService.acceptInvitation(token, userId);
            if (!result.success) {
                const statusCode = result.message.includes('not found') ? 404 :
                    result.message.includes('not authorized') ? 403 :
                        result.message.includes('expired') ? 400 : 400;
                return res.status(statusCode).json({
                    message: result.message
                });
            }
            res.json({
                message: result.message,
                data: {
                    invitation: result.invitation,
                    team: result.team,
                    user: result.user
                }
            });
        }
        catch (error) {
            console.error('Error accepting invitation with service:', error);
            res.status(500).json({
                message: 'Error accepting invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async declineInvitationWithService(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { token } = req.params;
            const userId = req.user.id;
            const result = await team_invitation_service_1.TeamInvitationService.declineInvitation(token, userId);
            if (!result.success) {
                const statusCode = result.message.includes('not found') ? 404 :
                    result.message.includes('not authorized') ? 403 :
                        result.message.includes('expired') ? 400 : 400;
                return res.status(statusCode).json({
                    message: result.message
                });
            }
            res.json({
                message: result.message,
                data: {
                    invitation: result.invitation
                }
            });
        }
        catch (error) {
            console.error('Error declining invitation with service:', error);
            res.status(500).json({
                message: 'Error declining invitation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getInvitationDetailsWithService(req, res) {
        try {
            const { token } = req.params;
            const result = await team_invitation_service_1.TeamInvitationService.getInvitationByToken(token);
            if (!result.success) {
                const statusCode = result.message.includes('not found') ? 404 :
                    result.message.includes('expired') ? 400 : 400;
                return res.status(statusCode).json({
                    message: result.message
                });
            }
            res.json({
                message: result.message,
                data: {
                    invitation: result.invitation
                }
            });
        }
        catch (error) {
            console.error('Error getting invitation details with service:', error);
            res.status(500).json({
                message: 'Error getting invitation details',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.TeamInvitationController = TeamInvitationController;
