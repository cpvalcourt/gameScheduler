import express from 'express';
import { TeamInvitationController } from '../controllers/team-invitation.controller';
import { authenticate } from '../middleware/auth';
import { requireVerifiedEmail } from '../middleware/require-verified-email';
import { body, param } from 'express-validator';

const router = express.Router();

// All routes require authentication and verified email
router.use(authenticate);
router.use(requireVerifiedEmail);

// Validation middleware
const sendInvitationValidation = [
    body('teamId')
        .isInt({ min: 1 })
        .withMessage('Team ID must be a positive integer'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('role')
        .isIn(['captain', 'player'])
        .withMessage('Role must be either "captain" or "player"')
];

const tokenValidation = [
    param('token')
        .notEmpty()
        .withMessage('Invitation token is required')
];

const invitationIdValidation = [
    param('invitationId')
        .isInt({ min: 1 })
        .withMessage('Invitation ID must be a positive integer'),
    param('teamId')
        .isInt({ min: 1 })
        .withMessage('Team ID must be a positive integer')
];

// Routes
router.post('/send', sendInvitationValidation, TeamInvitationController.sendInvitation);
router.get('/team/:teamId', TeamInvitationController.getTeamInvitations);
router.get('/my-invitations', TeamInvitationController.getMyInvitations);
router.get('/token/:token', tokenValidation, TeamInvitationController.getInvitationByToken);
router.post('/accept/:token', tokenValidation, TeamInvitationController.acceptInvitation);
router.post('/decline/:token', tokenValidation, TeamInvitationController.declineInvitation);
router.delete('/:teamId/:invitationId', invitationIdValidation, TeamInvitationController.deleteInvitation);

// Service-based routes with enhanced error handling and response structure
router.post('/service/accept/:token', tokenValidation, TeamInvitationController.acceptInvitationWithService);
router.post('/service/decline/:token', tokenValidation, TeamInvitationController.declineInvitationWithService);
router.get('/service/token/:token', tokenValidation, TeamInvitationController.getInvitationDetailsWithService);

export default router; 