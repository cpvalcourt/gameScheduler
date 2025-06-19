import { Router } from 'express';
import { body, param } from 'express-validator';
import { GameSeriesController } from '../controllers/game-series.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate } from '../middleware/auth';
import { requireVerifiedEmail } from '../middleware/require-verified-email';

const router = Router();

// All game series routes require authentication and email verification
router.use(authenticate);
router.use(requireVerifiedEmail);

// Validation middleware
const createSeriesValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Series name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('type')
        .isIn(['tournament', 'league', 'casual'])
        .withMessage('Invalid series type'),
    body('start_date')
        .isISO8601()
        .withMessage('Invalid start date'),
    body('end_date')
        .isISO8601()
        .withMessage('Invalid end date')
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        })
];

const updateSeriesValidation = [
    param('id').isInt().withMessage('Invalid series ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Series name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('type')
        .optional()
        .isIn(['tournament', 'league', 'casual'])
        .withMessage('Invalid series type'),
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date'),
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date')
        .custom((endDate, { req }) => {
            if (req.body.start_date && new Date(endDate) <= new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        })
];

// Routes
router.post(
    '/',
    createSeriesValidation,
    validateRequest,
    GameSeriesController.createSeries
);

router.get(
    '/',
    GameSeriesController.getUserSeries
);

router.get(
    '/:id',
    param('id').isInt().withMessage('Invalid series ID'),
    validateRequest,
    GameSeriesController.getSeries
);

router.put(
    '/:id',
    updateSeriesValidation,
    validateRequest,
    GameSeriesController.updateSeries
);

router.delete(
    '/:id',
    param('id').isInt().withMessage('Invalid series ID'),
    validateRequest,
    GameSeriesController.deleteSeries
);

export default router; 