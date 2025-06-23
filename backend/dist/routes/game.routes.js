"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const game_controller_1 = require("../controllers/game.controller");
const validate_request_1 = require("../middleware/validate-request");
const auth_1 = require("../middleware/auth");
const require_verified_email_1 = require("../middleware/require-verified-email");
const sport_types_1 = require("../constants/sport-types");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// All game routes require authentication and email verification
router.use(require_verified_email_1.requireVerifiedEmail);
// Validation middleware
const createGameValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name is required and must not exceed 255 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Invalid date'),
    (0, express_validator_1.body)('time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:mm)'),
    (0, express_validator_1.body)('location')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Location must be between 3 and 255 characters'),
    (0, express_validator_1.body)('max_players')
        .isInt({ min: 1 })
        .withMessage('Maximum players must be at least 1'),
    (0, express_validator_1.body)('status')
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid game status')
];
const updateGameValidation = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must not exceed 255 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    (0, express_validator_1.body)('sport_type')
        .optional()
        .custom((value) => sport_types_1.SPORT_TYPES_LOWERCASE.includes(value.toLowerCase()))
        .withMessage('Invalid sport type'),
    (0, express_validator_1.body)('date')
        .optional()
        .isDate()
        .withMessage('Invalid date'),
    (0, express_validator_1.body)('time')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:mm)'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),
    (0, express_validator_1.body)('min_players')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum players must be at least 0'),
    (0, express_validator_1.body)('max_players')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum players must be at least 0'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid game status')
];
// Routes for games in a series
router.get('/game-series/:seriesId/games', game_controller_1.GameController.getSeriesGames);
router.get('/game-series/:seriesId/games/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'), validate_request_1.validateRequest, game_controller_1.GameController.getGame);
router.post('/game-series/:seriesId/games', createGameValidation, validate_request_1.validateRequest, game_controller_1.GameController.createGame);
router.put('/game-series/:seriesId/games/:id', updateGameValidation, validate_request_1.validateRequest, game_controller_1.GameController.updateGame);
router.delete('/game-series/:seriesId/games/:id', (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'), validate_request_1.validateRequest, game_controller_1.GameController.deleteGame);
// Routes for game teams
router.post('/:id/teams', (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'), (0, express_validator_1.body)('team_id').isInt().withMessage('Invalid team ID'), validate_request_1.validateRequest, game_controller_1.GameController.addTeamToGame);
router.delete('/:id/teams/:teamId', (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'), (0, express_validator_1.param)('teamId').isInt().withMessage('Invalid team ID'), validate_request_1.validateRequest, game_controller_1.GameController.removeTeamFromGame);
// Route for game attendance
router.post('/:id/attendance', (0, express_validator_1.param)('id').isInt().withMessage('Invalid game ID'), (0, express_validator_1.body)('status').isIn(['attending', 'declined', 'maybe']).withMessage('Invalid attendance status'), (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'), validate_request_1.validateRequest, game_controller_1.GameController.updateAttendance);
// Create a new game
router.post('/series/:seriesId/games', auth_1.authenticate, [
    (0, express_validator_1.param)('seriesId').isInt(),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('sport_type').isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
    (0, express_validator_1.body)('date').isDate(),
    (0, express_validator_1.body)('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    (0, express_validator_1.body)('location').notEmpty().trim(),
    (0, express_validator_1.body)('min_players').isInt({ min: 1 }),
    (0, express_validator_1.body)('max_players').isInt({ min: 1 }),
    (0, express_validator_1.body)('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
], validate_request_1.validateRequest, game_controller_1.GameController.createGame);
// Bulk create games
router.post('/series/:seriesId/games/bulk', auth_1.authenticate, [
    (0, express_validator_1.param)('seriesId').isInt(),
    (0, express_validator_1.body)('games').isArray(),
    (0, express_validator_1.body)('games.*.name').notEmpty().trim(),
    (0, express_validator_1.body)('games.*.description').optional().trim(),
    (0, express_validator_1.body)('games.*.sport_type').isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
    (0, express_validator_1.body)('games.*.date').isDate(),
    (0, express_validator_1.body)('games.*.time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    (0, express_validator_1.body)('games.*.location').notEmpty().trim(),
    (0, express_validator_1.body)('games.*.min_players').isInt({ min: 1 }),
    (0, express_validator_1.body)('games.*.max_players').isInt({ min: 1 }),
    (0, express_validator_1.body)('games.*.status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
], validate_request_1.validateRequest, game_controller_1.GameController.bulkCreateGames);
// Search games
router.get('/games/search', auth_1.authenticate, [
    (0, express_validator_1.query)('seriesId').optional().isInt(),
    (0, express_validator_1.query)('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    (0, express_validator_1.query)('sportType').optional().isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
    (0, express_validator_1.query)('startDate').optional().isDate(),
    (0, express_validator_1.query)('endDate').optional().isDate(),
    (0, express_validator_1.query)('location').optional().trim(),
    (0, express_validator_1.query)('minPlayers').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('maxPlayers').optional().isInt({ min: 1 })
], validate_request_1.validateRequest, game_controller_1.GameController.searchGames);
// Get game statistics
router.get('/games/:id/stats', auth_1.authenticate, [
    (0, express_validator_1.param)('id').isInt()
], validate_request_1.validateRequest, game_controller_1.GameController.getGameStats);
exports.default = router;
