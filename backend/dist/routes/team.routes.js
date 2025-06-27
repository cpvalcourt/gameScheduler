"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const team_controller_1 = require("../controllers/team.controller");
const validate_request_1 = require("../middleware/validate-request");
const auth_1 = require("../middleware/auth");
const require_verified_email_1 = require("../middleware/require-verified-email");
const router = (0, express_1.Router)();
// All team routes require authentication and email verification
router.use(auth_1.authenticate);
router.use(require_verified_email_1.requireVerifiedEmail);
// Validation middleware
const createTeamValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];
const updateTeamValidation = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];
const addMemberValidation = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Invalid email address'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'captain', 'player', 'snack_provider'])
        .withMessage('Invalid role')
];
const updateMemberRoleValidation = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'),
    (0, express_validator_1.param)('memberId').isInt().withMessage('Invalid member ID'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'captain', 'player', 'snack_provider'])
        .withMessage('Invalid role')
];
// Routes
router.post('/', createTeamValidation, validate_request_1.validateRequest, team_controller_1.TeamController.createTeam);
router.get('/', team_controller_1.TeamController.getUserTeams);
router.get('/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'), validate_request_1.validateRequest, team_controller_1.TeamController.getTeam);
router.get('/:id/stats', (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'), validate_request_1.validateRequest, team_controller_1.TeamController.getTeamStats);
router.put('/:id', updateTeamValidation, validate_request_1.validateRequest, team_controller_1.TeamController.updateTeam);
router.delete('/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'), validate_request_1.validateRequest, team_controller_1.TeamController.deleteTeam);
router.post('/:id/members', addMemberValidation, validate_request_1.validateRequest, team_controller_1.TeamController.addMember);
router.delete('/:id/members/:memberId', (0, express_validator_1.param)('id').isInt().withMessage('Invalid team ID'), (0, express_validator_1.param)('memberId').isInt().withMessage('Invalid member ID'), validate_request_1.validateRequest, team_controller_1.TeamController.removeMember);
router.put('/:id/members/:memberId/role', updateMemberRoleValidation, validate_request_1.validateRequest, team_controller_1.TeamController.updateMemberRole);
exports.default = router;
