"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const game_series_controller_1 = require("../controllers/game-series.controller");
const validate_request_1 = require("../middleware/validate-request");
const auth_1 = require("../middleware/auth");
const require_verified_email_1 = require("../middleware/require-verified-email");
const router = (0, express_1.Router)();
// All game series routes require authentication and email verification
router.use(auth_1.authenticate);
router.use(require_verified_email_1.requireVerifiedEmail);
// Validation middleware
const createSeriesValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Series name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['tournament', 'league', 'casual'])
        .withMessage('Invalid series type'),
    (0, express_validator_1.body)('start_date')
        .isISO8601()
        .withMessage('Invalid start date'),
    (0, express_validator_1.body)('end_date')
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
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid series ID'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Series name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['tournament', 'league', 'casual'])
        .withMessage('Invalid series type'),
    (0, express_validator_1.body)('start_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date'),
    (0, express_validator_1.body)('end_date')
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
router.post('/', createSeriesValidation, validate_request_1.validateRequest, game_series_controller_1.GameSeriesController.createSeries);
router.get('/', game_series_controller_1.GameSeriesController.getUserSeries);
router.get('/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid series ID'), validate_request_1.validateRequest, game_series_controller_1.GameSeriesController.getSeries);
router.put('/:id', updateSeriesValidation, validate_request_1.validateRequest, game_series_controller_1.GameSeriesController.updateSeries);
router.delete('/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid series ID'), validate_request_1.validateRequest, game_series_controller_1.GameSeriesController.deleteSeries);
exports.default = router;
