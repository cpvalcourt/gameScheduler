import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { GameController } from '../controllers/game.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate } from '../middleware/auth';
import { requireVerifiedEmail } from '../middleware/require-verified-email';
import { SPORT_TYPES, SPORT_TYPES_LOWERCASE } from '../constants/sport-types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// All game routes require authentication and email verification
router.use(requireVerifiedEmail);

// Validation middleware
const createGameValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name is required and must not exceed 255 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('date')
        .isISO8601()
        .withMessage('Invalid date'),
    body('time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:mm)'),
    body('location')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Location must be between 3 and 255 characters'),
    body('max_players')
        .isInt({ min: 1 })
        .withMessage('Maximum players must be at least 1'),
    body('status')
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid game status')
];

const updateGameValidation = [
    param('id').isInt().withMessage('Invalid game ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must not exceed 255 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('sport_type')
        .optional()
        .custom((value) => SPORT_TYPES_LOWERCASE.includes(value.toLowerCase()))
        .withMessage('Invalid sport type'),
    body('date')
        .optional()
        .isDate()
        .withMessage('Invalid date'),
    body('time')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:mm)'),
    body('location')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),
    body('min_players')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum players must be at least 0'),
    body('max_players')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum players must be at least 0'),
    body('status')
        .optional()
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid game status')
];

// Routes for games in a series
router.get('/game-series/:seriesId/games', GameController.getSeriesGames);
router.get('/game-series/:seriesId/games/:id', param('id').isInt().withMessage('Invalid game ID'), validateRequest, GameController.getGame);
router.post('/game-series/:seriesId/games', createGameValidation, validateRequest, GameController.createGame);
router.put('/game-series/:seriesId/games/:id', updateGameValidation, validateRequest, GameController.updateGame);
router.delete('/game-series/:seriesId/games/:id', param('id').isInt().withMessage('Invalid game ID'), validateRequest, GameController.deleteGame);

// Routes for game teams
router.post('/:id/teams', 
    param('id').isInt().withMessage('Invalid game ID'),
    body('team_id').isInt().withMessage('Invalid team ID'),
    validateRequest,
    GameController.addTeamToGame
);

router.delete('/:id/teams/:teamId',
    param('id').isInt().withMessage('Invalid game ID'),
    param('teamId').isInt().withMessage('Invalid team ID'),
    validateRequest,
    GameController.removeTeamFromGame
);

// Route for game attendance
router.post('/:id/attendance',
    param('id').isInt().withMessage('Invalid game ID'),
    body('status').isIn(['attending', 'declined', 'maybe']).withMessage('Invalid attendance status'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
    validateRequest,
    GameController.updateAttendance
);

// Create a new game
router.post(
    '/series/:seriesId/games',
    authenticate,
    [
        param('seriesId').isInt(),
        body('name').notEmpty().trim(),
        body('description').optional().trim(),
        body('sport_type').isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
        body('date').isDate(),
        body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('location').notEmpty().trim(),
        body('min_players').isInt({ min: 1 }),
        body('max_players').isInt({ min: 1 }),
        body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    ],
    validateRequest,
    GameController.createGame
);

// Bulk create games
router.post(
    '/series/:seriesId/games/bulk',
    authenticate,
    [
        param('seriesId').isInt(),
        body('games').isArray(),
        body('games.*.name').notEmpty().trim(),
        body('games.*.description').optional().trim(),
        body('games.*.sport_type').isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
        body('games.*.date').isDate(),
        body('games.*.time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('games.*.location').notEmpty().trim(),
        body('games.*.min_players').isInt({ min: 1 }),
        body('games.*.max_players').isInt({ min: 1 }),
        body('games.*.status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    ],
    validateRequest,
    GameController.bulkCreateGames
);

// Search games
router.get(
    '/games/search',
    authenticate,
    [
        query('seriesId').optional().isInt(),
        query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
        query('sportType').optional().isIn(['basketball', 'soccer', 'volleyball', 'tennis', 'baseball', 'football', 'hockey', 'other']),
        query('startDate').optional().isDate(),
        query('endDate').optional().isDate(),
        query('location').optional().trim(),
        query('minPlayers').optional().isInt({ min: 1 }),
        query('maxPlayers').optional().isInt({ min: 1 })
    ],
    validateRequest,
    GameController.searchGames
);

// Get game statistics
router.get(
    '/games/:id/stats',
    authenticate,
    [
        param('id').isInt()
    ],
    validateRequest,
    GameController.getGameStats
);

export default router; 