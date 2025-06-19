import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/admin.middleware';
import { body, query } from 'express-validator';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Validation middleware
const updateRoleValidation = [
    body('role')
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role must be user, moderator, or admin')
];

const updateNotesValidation = [
    body('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string')
];

const bulkUpdateValidation = [
    body('userIds')
        .isArray({ min: 1 })
        .withMessage('User IDs must be a non-empty array'),
    body('userIds.*')
        .isInt({ min: 1 })
        .withMessage('Each user ID must be a positive integer')
];

const bulkToggleValidation = [
    body('userIds')
        .isArray({ min: 1 })
        .withMessage('User IDs must be a non-empty array'),
    body('userIds.*')
        .isInt({ min: 1 })
        .withMessage('Each user ID must be a positive integer'),
    body('isActive')
        .isBoolean()
        .withMessage('isActive must be a boolean')
];

const queryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('role')
        .optional()
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role filter must be user, moderator, or admin'),
    query('is_active')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_active filter must be true or false'),
    query('is_verified')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_verified filter must be true or false')
];

// Routes
router.get('/users', AdminController.getUsers);
router.get('/users/stats', AdminController.getStats);
router.get('/users/:id', AdminController.getUserById);

router.patch('/users/:id/role', updateRoleValidation, AdminController.updateUserRole);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.patch('/users/:id/notes', updateNotesValidation, AdminController.updateAdminNotes);

router.post('/users/bulk/roles', bulkUpdateValidation, AdminController.bulkUpdateRoles);
router.post('/users/bulk/status', bulkToggleValidation, AdminController.bulkToggleStatus);

export default router; 