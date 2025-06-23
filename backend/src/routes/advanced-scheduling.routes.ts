import { Router } from 'express';
import { AdvancedSchedulingController } from '../controllers/advanced-scheduling.controller';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation middleware
const createRecurringPatternValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be between 1 and 255 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('frequency')
        .isIn(['weekly', 'bi_weekly', 'monthly', 'custom'])
        .withMessage('Frequency must be weekly, bi_weekly, monthly, or custom'),
    body('interval')
        .optional()
        .isInt({ min: 1, max: 52 })
        .withMessage('Interval must be between 1 and 52'),
    body('day_of_week')
        .isInt({ min: 0, max: 6 })
        .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    body('start_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('location')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),
    body('min_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Min players must be between 1 and 100'),
    body('max_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Max players must be between 1 and 100'),
    body('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('end_date')
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
    body('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('end_date')
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
    body('date')
        .isISO8601()
        .withMessage('Date must be a valid date'),
    body('time_slot')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time slot must be in HH:MM-HH:MM format'),
    body('status')
        .isIn(['available', 'unavailable', 'maybe'])
        .withMessage('Status must be available, unavailable, or maybe'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters')
];

const findOptimalTimeSlotValidation = [
    body('date')
        .isISO8601()
        .withMessage('Date must be a valid date'),
    body('duration')
        .optional()
        .isInt({ min: 30, max: 480 })
        .withMessage('Duration must be between 30 and 480 minutes'),
    body('min_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Min players must be between 1 and 100'),
    body('max_players')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Max players must be between 1 and 100')
];

const getAvailabilityValidation = [
    query('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    query('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            const startDate = req.query?.start_date as string;
            if (startDate && new Date(value) <= new Date(startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        })
];

const getTeamAvailabilityValidation = [
    query('date')
        .isISO8601()
        .withMessage('Date must be a valid date')
];

// Apply auth middleware to all routes
router.use(authenticate);

// Recurring Pattern Routes
router.post(
    '/series/:seriesId/recurring-patterns',
    createRecurringPatternValidation,
    AdvancedSchedulingController.createRecurringPattern
);

router.get(
    '/series/:seriesId/recurring-patterns',
    AdvancedSchedulingController.getRecurringPatterns
);

router.post(
    '/recurring-patterns/:patternId/generate-games',
    generateGamesValidation,
    AdvancedSchedulingController.generateGamesFromPattern
);

// Player Availability Routes
router.post(
    '/availability',
    setAvailabilityValidation,
    AdvancedSchedulingController.setPlayerAvailability
);

router.get(
    '/availability/:userId',
    getAvailabilityValidation,
    AdvancedSchedulingController.getPlayerAvailability
);

// Conflict Detection Routes
router.get(
    '/games/:gameId/conflicts',
    AdvancedSchedulingController.detectGameConflicts
);

// Smart Scheduling Routes
router.post(
    '/series/:seriesId/optimal-time-slot',
    findOptimalTimeSlotValidation,
    AdvancedSchedulingController.findOptimalTimeSlot
);

// Team Availability Routes
router.get(
    '/teams/:teamId/availability-summary',
    getTeamAvailabilityValidation,
    AdvancedSchedulingController.getTeamAvailabilitySummary
);

export default router; 