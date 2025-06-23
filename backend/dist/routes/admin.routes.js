"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_middleware_1 = require("../middleware/admin.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Apply admin middleware to all routes
router.use(admin_middleware_1.requireAdmin);
// Validation middleware
const updateRoleValidation = [
    (0, express_validator_1.body)('role')
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role must be user, moderator, or admin')
];
const updateNotesValidation = [
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string')
];
const bulkUpdateValidation = [
    (0, express_validator_1.body)('userIds')
        .isArray({ min: 1 })
        .withMessage('User IDs must be a non-empty array'),
    (0, express_validator_1.body)('userIds.*')
        .isInt({ min: 1 })
        .withMessage('Each user ID must be a positive integer')
];
const bulkToggleValidation = [
    (0, express_validator_1.body)('userIds')
        .isArray({ min: 1 })
        .withMessage('User IDs must be a non-empty array'),
    (0, express_validator_1.body)('userIds.*')
        .isInt({ min: 1 })
        .withMessage('Each user ID must be a positive integer'),
    (0, express_validator_1.body)('isActive')
        .isBoolean()
        .withMessage('isActive must be a boolean')
];
const queryValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('role')
        .optional()
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role filter must be user, moderator, or admin'),
    (0, express_validator_1.query)('is_active')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_active filter must be true or false'),
    (0, express_validator_1.query)('is_verified')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_verified filter must be true or false')
];
// Routes
router.get('/users', admin_controller_1.AdminController.getUsers);
router.get('/users/stats', admin_controller_1.AdminController.getStats);
router.get('/users/:id', admin_controller_1.AdminController.getUserById);
router.patch('/users/:id/role', updateRoleValidation, admin_controller_1.AdminController.updateUserRole);
router.patch('/users/:id/status', admin_controller_1.AdminController.toggleUserStatus);
router.patch('/users/:id/notes', updateNotesValidation, admin_controller_1.AdminController.updateAdminNotes);
router.post('/users/bulk/roles', bulkUpdateValidation, admin_controller_1.AdminController.bulkUpdateRoles);
router.post('/users/bulk/status', bulkToggleValidation, admin_controller_1.AdminController.bulkToggleStatus);
exports.default = router;
