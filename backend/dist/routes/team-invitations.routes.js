"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const team_invitation_controller_1 = require("../controllers/team-invitation.controller");
const auth_1 = require("../middleware/auth");
const require_verified_email_1 = require("../middleware/require-verified-email");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// All routes require authentication and verified email
router.use(auth_1.authenticate);
router.use(require_verified_email_1.requireVerifiedEmail);
// Validation middleware
const sendInvitationValidation = [
    (0, express_validator_1.body)('teamId')
        .isInt({ min: 1 })
        .withMessage('Team ID must be a positive integer'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('role')
        .isIn(['captain', 'player'])
        .withMessage('Role must be either "captain" or "player"')
];
const tokenValidation = [
    (0, express_validator_1.param)('token')
        .notEmpty()
        .withMessage('Invitation token is required')
];
const invitationIdValidation = [
    (0, express_validator_1.param)('invitationId')
        .isInt({ min: 1 })
        .withMessage('Invitation ID must be a positive integer'),
    (0, express_validator_1.param)('teamId')
        .isInt({ min: 1 })
        .withMessage('Team ID must be a positive integer')
];
// Routes
router.post('/send', sendInvitationValidation, team_invitation_controller_1.TeamInvitationController.sendInvitation);
router.get('/team/:teamId', team_invitation_controller_1.TeamInvitationController.getTeamInvitations);
router.get('/my-invitations', team_invitation_controller_1.TeamInvitationController.getMyInvitations);
router.get('/token/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.getInvitationByToken);
router.post('/accept/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.acceptInvitation);
router.post('/decline/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.declineInvitation);
router.delete('/:teamId/:invitationId', invitationIdValidation, team_invitation_controller_1.TeamInvitationController.deleteInvitation);
// Service-based routes with enhanced error handling and response structure
router.post('/service/accept/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.acceptInvitationWithService);
router.post('/service/decline/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.declineInvitationWithService);
router.get('/service/token/:token', tokenValidation, team_invitation_controller_1.TeamInvitationController.getInvitationDetailsWithService);
exports.default = router;
