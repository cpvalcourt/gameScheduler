import { Router } from 'express';
import { body, param } from 'express-validator';
import { TeamController } from '../controllers/team.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate } from '../middleware/auth';
import { requireVerifiedEmail } from '../middleware/require-verified-email';

const router = Router();

// All team routes require authentication and email verification
router.use(authenticate);
router.use(requireVerifiedEmail);

// Validation middleware
const createTeamValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];

const updateTeamValidation = [
    param('id').isInt().withMessage('Invalid team ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];

const addMemberValidation = [
    param('id').isInt().withMessage('Invalid team ID'),
    body('email')
        .isEmail()
        .withMessage('Invalid email address'),
    body('role')
        .isIn(['admin', 'captain', 'player', 'snack_provider'])
        .withMessage('Invalid role')
];

const updateMemberRoleValidation = [
    param('id').isInt().withMessage('Invalid team ID'),
    param('memberId').isInt().withMessage('Invalid member ID'),
    body('role')
        .isIn(['admin', 'captain', 'player', 'snack_provider'])
        .withMessage('Invalid role')
];

// Routes
router.post(
    '/',
    createTeamValidation,
    validateRequest,
    TeamController.createTeam
);

router.get(
    '/',
    TeamController.getUserTeams
);

router.get(
    '/:id',
    param('id').isInt().withMessage('Invalid team ID'),
    validateRequest,
    TeamController.getTeam
);

router.get(
    '/:id/stats',
    param('id').isInt().withMessage('Invalid team ID'),
    validateRequest,
    TeamController.getTeamStats
);

router.put(
    '/:id',
    updateTeamValidation,
    validateRequest,
    TeamController.updateTeam
);

router.delete(
    '/:id',
    param('id').isInt().withMessage('Invalid team ID'),
    validateRequest,
    TeamController.deleteTeam
);

router.post(
    '/:id/members',
    addMemberValidation,
    validateRequest,
    TeamController.addMember
);

router.delete(
    '/:id/members/:memberId',
    param('id').isInt().withMessage('Invalid team ID'),
    param('memberId').isInt().withMessage('Invalid member ID'),
    validateRequest,
    TeamController.removeMember
);

router.put(
    '/:id/members/:memberId/role',
    updateMemberRoleValidation,
    validateRequest,
    TeamController.updateMemberRole
);

export default router; 