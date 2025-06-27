"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamInvitationService = void 0;
const team_invitation_model_1 = require("../models/team-invitation.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
class TeamInvitationService {
    /**
     * Accept a team invitation by token
     * @param token - The invitation token
     * @param userId - The ID of the user accepting the invitation
     * @returns Promise<InvitationResult>
     */
    static async acceptInvitation(token, userId) {
        try {
            // Find the invitation by token
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return {
                    success: false,
                    message: 'Invitation not found'
                };
            }
            // Check if invitation is still pending
            if (invitation.status !== 'pending') {
                return {
                    success: false,
                    message: `Invitation is no longer valid. Current status: ${invitation.status}`
                };
            }
            // Check if invitation has expired
            if (invitation.expires_at < new Date()) {
                await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'expired');
                return {
                    success: false,
                    message: 'Invitation has expired'
                };
            }
            // Verify the user is the one invited
            const user = await user_model_1.UserModel.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            if (user.email !== invitation.invited_email) {
                return {
                    success: false,
                    message: 'You are not authorized to accept this invitation'
                };
            }
            // Check if user is already a member of the team
            const isAlreadyMember = await team_model_1.TeamModel.isTeamMember(invitation.team_id, userId);
            if (isAlreadyMember) {
                return {
                    success: false,
                    message: 'You are already a member of this team'
                };
            }
            // Get team details
            const team = await team_model_1.TeamModel.findById(invitation.team_id);
            if (!team) {
                return {
                    success: false,
                    message: 'Team not found'
                };
            }
            // Add user to team
            const teamMember = await team_model_1.TeamModel.addMember(invitation.team_id, userId, invitation.invited_role);
            // Update invitation status to accepted
            await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'accepted');
            return {
                success: true,
                message: 'Invitation accepted successfully',
                invitation: {
                    id: invitation.id,
                    team_id: invitation.team_id,
                    team_name: invitation.team_name,
                    invited_role: invitation.invited_role,
                    status: 'accepted',
                    expires_at: invitation.expires_at,
                    created_at: invitation.created_at,
                    invited_by_username: invitation.invited_by_username
                },
                team: {
                    id: team.id,
                    name: team.name,
                    description: team.description
                },
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            };
        }
        catch (error) {
            console.error('Error in TeamInvitationService.acceptInvitation:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Decline a team invitation by token
     * @param token - The invitation token
     * @param userId - The ID of the user declining the invitation
     * @returns Promise<InvitationResult>
     */
    static async declineInvitation(token, userId) {
        try {
            // Find the invitation by token
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return {
                    success: false,
                    message: 'Invitation not found'
                };
            }
            // Check if invitation is still pending
            if (invitation.status !== 'pending') {
                return {
                    success: false,
                    message: `Invitation is no longer valid. Current status: ${invitation.status}`
                };
            }
            // Verify the user is the one invited
            const user = await user_model_1.UserModel.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            if (user.email !== invitation.invited_email) {
                return {
                    success: false,
                    message: 'You are not authorized to decline this invitation'
                };
            }
            // Update invitation status to declined
            await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'declined');
            return {
                success: true,
                message: 'Invitation declined successfully',
                invitation: {
                    id: invitation.id,
                    team_id: invitation.team_id,
                    team_name: invitation.team_name,
                    invited_role: invitation.invited_role,
                    status: 'declined',
                    expires_at: invitation.expires_at,
                    created_at: invitation.created_at,
                    invited_by_username: invitation.invited_by_username
                }
            };
        }
        catch (error) {
            console.error('Error in TeamInvitationService.declineInvitation:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Get invitation details by token
     * @param token - The invitation token
     * @returns Promise<InvitationResult>
     */
    static async getInvitationByToken(token) {
        try {
            const invitation = await team_invitation_model_1.TeamInvitationModel.findByToken(token);
            if (!invitation) {
                return {
                    success: false,
                    message: 'Invitation not found'
                };
            }
            // Check if invitation has expired
            if (invitation.expires_at < new Date()) {
                await team_invitation_model_1.TeamInvitationModel.updateStatus(token, 'expired');
                return {
                    success: false,
                    message: 'Invitation has expired'
                };
            }
            return {
                success: true,
                message: 'Invitation found',
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
            };
        }
        catch (error) {
            console.error('Error in TeamInvitationService.getInvitationByToken:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Get all invitations for a specific user
     * @param userEmail - The email of the user
     * @returns Promise<InvitationResult>
     */
    static async getUserInvitations(userEmail) {
        try {
            const invitations = await team_invitation_model_1.TeamInvitationModel.findByEmail(userEmail);
            return {
                success: true,
                message: `Found ${invitations.length} invitation(s)`,
                invitation: invitations.map(inv => ({
                    id: inv.id,
                    team_id: inv.team_id,
                    team_name: inv.team_name,
                    invited_email: inv.invited_email,
                    invited_role: inv.invited_role,
                    status: inv.status,
                    expires_at: inv.expires_at,
                    created_at: inv.created_at,
                    invited_by_username: inv.invited_by_username
                }))
            };
        }
        catch (error) {
            console.error('Error in TeamInvitationService.getUserInvitations:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
exports.TeamInvitationService = TeamInvitationService;
