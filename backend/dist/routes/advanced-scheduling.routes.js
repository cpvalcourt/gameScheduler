"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const advanced_scheduling_controller_1 = require("../controllers/advanced-scheduling.controller");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation middleware
const createRecurringPatternValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be between 1 and 255 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('frequency')
        .isIn(['weekly', 'bi_weekly', 'monthly', 'custom'])
        .withMessage('Frequency must be weekly, bi_weekly, monthly, or custom'),
    (0, express_validator_1.body)('interval')
        .optional()
        .isInt({ min: 1, max: 52 })
        .withMessage('Interval must be between 1 and 52'),
    (0, express_validator_1.body)('day_of_week')
        .isInt({ min: 0, max: 6 })
        .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    (0, express_validator_1.body)('start_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    (0, express_validator_1.body)('end_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    (0, express_validator_1.body)('location')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),
    (0, express_validator_1.body)('min_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Min players must be between 1 and 100'),
    (0, express_validator_1.body)('max_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Max players must be between 1 and 100'),
    (0, express_validator_1.body)('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date)) {
            throw new Error('End date must be after start date');
        }
        return true;
    })
];
const generateGamesValidation = [
    (0, express_validator_1.body)('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date)) {
            throw new Error('End date must be after start date');
        }
        return true;
    })
];
const setAvailabilityValidation = [
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Date must be a valid date'),
    (0, express_validator_1.body)('time_slot')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time slot must be in HH:MM-HH:MM format'),
    (0, express_validator_1.body)('status')
        .isIn(['available', 'unavailable', 'maybe'])
        .withMessage('Status must be available, unavailable, or maybe'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters')
];
const findOptimalTimeSlotValidation = [
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Date must be a valid date'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 30, max: 480 })
        .withMessage('Duration must be between 30 and 480 minutes'),
    (0, express_validator_1.body)('min_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Min players must be between 1 and 100'),
    (0, express_validator_1.body)('max_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Max players must be between 1 and 100')
];
const getAvailabilityValidation = [
    (0, express_validator_1.query)('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    (0, express_validator_1.query)('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
        const startDate = req.query?.start_date;
        if (startDate && new Date(value) <= new Date(startDate)) {
            throw new Error('End date must be after start date');
        }
        return true;
    })
];
const getTeamAvailabilityValidation = [
    (0, express_validator_1.query)('date')
        .isISO8601()
        .withMessage('Date must be a valid date')
];
// Apply auth middleware to all routes
router.use(auth_1.authenticate);
// Recurring Pattern Routes
router.post('/series/:seriesId/recurring-patterns', createRecurringPatternValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.createRecurringPattern);
router.get('/series/:seriesId/recurring-patterns', advanced_scheduling_controller_1.AdvancedSchedulingController.getRecurringPatterns);
router.post('/recurring-patterns/:patternId/generate-games', generateGamesValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.generateGamesFromPattern);
// Player Availability Routes
router.post('/availability', setAvailabilityValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.setPlayerAvailability);
router.get('/availability/:userId', getAvailabilityValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.getPlayerAvailability);
// Conflict Detection Routes
router.get('/games/:gameId/conflicts', advanced_scheduling_controller_1.AdvancedSchedulingController.detectGameConflicts);
// Smart Scheduling Routes
router.post('/series/:seriesId/optimal-time-slot', findOptimalTimeSlotValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.findOptimalTimeSlot);
// Team Availability Routes
router.get('/teams/:teamId/availability-summary', getTeamAvailabilityValidation, advanced_scheduling_controller_1.AdvancedSchedulingController.getTeamAvailabilitySummary);
exports.default = router;
