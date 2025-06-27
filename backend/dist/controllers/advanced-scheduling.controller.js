"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSchedulingController = void 0;
const advanced_scheduling_model_1 = require("../models/advanced-scheduling.model");
const game_series_model_1 = require("../models/game-series.model");
const game_model_1 = require("../models/game.model");
class AdvancedSchedulingController {
    // Recurring Pattern Methods
    static async createRecurringPattern(req, res) {
        try {
            const { seriesId } = req.params;
            const { name, description, frequency, interval, day_of_week, start_time, end_time, location, min_players, max_players, start_date, end_date } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to create patterns for this series' });
            }
            const pattern = await advanced_scheduling_model_1.AdvancedSchedulingModel.createRecurringPattern({
                series_id: parseInt(seriesId),
                name,
                description,
                frequency,
                interval: interval || 1,
                day_of_week,
                start_time,
                end_time,
                location,
                min_players: min_players || 1,
                max_players: max_players || 20,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_active: true,
                created_by: user.id
            });
            res.status(201).json({
                message: 'Recurring pattern created successfully',
                pattern
            });
        }
        catch (error) {
            console.error('Error creating recurring pattern:', error);
            res.status(500).json({ message: 'Error creating recurring pattern' });
        }
    }
    static async generateGamesFromPattern(req, res) {
        try {
            const { patternId } = req.params;
            const { start_date, end_date } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const pattern = await advanced_scheduling_model_1.AdvancedSchedulingModel.getRecurringPattern(parseInt(patternId));
            if (!pattern) {
                return res.status(404).json({ message: 'Recurring pattern not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(pattern.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to generate games from this pattern' });
            }
            const generatedGameIds = await advanced_scheduling_model_1.AdvancedSchedulingModel.generateGamesFromPattern(parseInt(patternId), new Date(start_date), new Date(end_date));
            res.json({
                message: `${generatedGameIds.length} games generated successfully`,
                generatedGameIds,
                pattern
            });
        }
        catch (error) {
            console.error('Error generating games from pattern:', error);
            res.status(500).json({ message: 'Error generating games from pattern' });
        }
    }
    static async getRecurringPatterns(req, res) {
        try {
            const { seriesId } = req.params;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to view patterns for this series' });
            }
            const [rows] = await database_1.pool.execute('SELECT * FROM RECURRING_PATTERNS WHERE SERIES_ID = ? ORDER BY CREATED_AT DESC', [seriesId]);
            const patterns = rows.map(row => ({
                id: row.ID,
                series_id: row.SERIES_ID,
                name: row.NAME,
                description: row.DESCRIPTION,
                frequency: row.FREQUENCY,
                interval: row['INTERVAL'],
                day_of_week: row.DAY_OF_WEEK,
                start_time: row.START_TIME,
                end_time: row.END_TIME,
                location: row.LOCATION,
                min_players: row.MIN_PLAYERS,
                max_players: row.MAX_PLAYERS,
                start_date: row.START_DATE,
                end_date: row.END_DATE,
                is_active: row.IS_ACTIVE,
                created_by: row.CREATED_BY,
                created_at: row.CREATED_AT,
                updated_at: row.UPDATED_AT
            }));
            res.json(patterns);
        }
        catch (error) {
            console.error('Error getting recurring patterns:', error);
            res.status(500).json({ message: 'Error getting recurring patterns' });
        }
    }
    // Player Availability Methods
    static async setPlayerAvailability(req, res) {
        try {
            const { date, time_slot, status, notes } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const availability = await advanced_scheduling_model_1.AdvancedSchedulingModel.setPlayerAvailability({
                user_id: user.id,
                date: new Date(date),
                time_slot,
                status,
                notes: notes || ''
            });
            res.json({
                message: 'Availability updated successfully',
                availability
            });
        }
        catch (error) {
            console.error('Error setting player availability:', error);
            res.status(500).json({ message: 'Error setting player availability' });
        }
    }
    static async getPlayerAvailability(req, res) {
        try {
            const { userId } = req.params;
            const { start_date, end_date } = req.query;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Users can only view their own availability or team members' availability
            const targetUserId = parseInt(userId);
            if (targetUserId !== user.id) {
                // Check if user is a team captain/admin and can view team member availability
                const [teamMembership] = await database_1.pool.execute(`SELECT tm.ROLE 
                     FROM TEAM_MEMBERS tm1
                     JOIN TEAM_MEMBERS tm2 ON tm1.TEAM_ID = tm2.TEAM_ID
                     JOIN TEAM_MEMBERS tm ON tm.TEAM_ID = tm1.TEAM_ID
                     WHERE tm1.USER_ID = ? AND tm2.USER_ID = ? AND tm.USER_ID = ?
                     AND tm1.ROLE IN ('admin', 'captain')`, [user.id, targetUserId, targetUserId]);
                if (!teamMembership.length) {
                    return res.status(403).json({ message: 'Not authorized to view this user\'s availability' });
                }
            }
            const availability = await advanced_scheduling_model_1.AdvancedSchedulingModel.getPlayerAvailability(targetUserId, new Date(start_date), new Date(end_date));
            res.json(availability);
        }
        catch (error) {
            console.error('Error getting player availability:', error);
            res.status(500).json({ message: 'Error getting player availability' });
        }
    }
    // Conflict Detection Methods
    static async detectGameConflicts(req, res) {
        try {
            const { gameId } = req.params;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(parseInt(gameId));
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(game.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to view conflicts for this game' });
            }
            const conflicts = await advanced_scheduling_model_1.AdvancedSchedulingModel.detectConflicts(parseInt(gameId));
            res.json({
                gameId: parseInt(gameId),
                conflicts,
                conflictCount: conflicts.length
            });
        }
        catch (error) {
            console.error('Error detecting game conflicts:', error);
            res.status(500).json({ message: 'Error detecting game conflicts' });
        }
    }
    // Smart Scheduling Methods
    static async findOptimalTimeSlot(req, res) {
        try {
            const { seriesId } = req.params;
            const { date, duration, min_players, max_players } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to find optimal time slots for this series' });
            }
            const optimalSlot = await advanced_scheduling_model_1.AdvancedSchedulingModel.findOptimalTimeSlot(parseInt(seriesId), new Date(date), duration || 120, // Default 2 hours
            min_players || 1, max_players || 20);
            if (!optimalSlot) {
                return res.status(404).json({ message: 'No suitable time slot found' });
            }
            res.json({
                message: 'Optimal time slot found',
                optimalSlot
            });
        }
        catch (error) {
            console.error('Error finding optimal time slot:', error);
            res.status(500).json({ message: 'Error finding optimal time slot' });
        }
    }
    // Team Availability Summary
    static async getTeamAvailabilitySummary(req, res) {
        try {
            const { teamId } = req.params;
            const { date } = req.query;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify user has access to the team
            const [teamMembership] = await database_1.pool.execute('SELECT ROLE FROM TEAM_MEMBERS WHERE TEAM_ID = ? AND USER_ID = ?', [teamId, user.id]);
            if (!teamMembership.length) {
                return res.status(403).json({ message: 'Not authorized to view this team\'s availability' });
            }
            const targetDate = new Date(date);
            const timeSlots = ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];
            const availabilitySummary = [];
            for (const timeSlot of timeSlots) {
                const [rows] = await database_1.pool.execute(`SELECT 
                        pa.STATUS,
                        COUNT(*) as count
                     FROM TEAM_MEMBERS tm
                     LEFT JOIN PLAYER_AVAILABILITY pa ON tm.USER_ID = pa.USER_ID 
                        AND pa.DATE = ? AND pa.TIME_SLOT = ?
                     WHERE tm.TEAM_ID = ?
                     GROUP BY pa.STATUS`, [targetDate, timeSlot, teamId]);
                const summary = {
                    timeSlot,
                    available: 0,
                    unavailable: 0,
                    maybe: 0,
                    notSet: 0
                };
                for (const row of rows) {
                    if (row.STATUS === 'available')
                        summary.available = row.count;
                    else if (row.STATUS === 'unavailable')
                        summary.unavailable = row.count;
                    else if (row.STATUS === 'maybe')
                        summary.maybe = row.count;
                    else
                        summary.notSet = row.count;
                }
                availabilitySummary.push(summary);
            }
            res.json({
                teamId: parseInt(teamId),
                date: targetDate,
                availabilitySummary
            });
        }
        catch (error) {
            console.error('Error getting team availability summary:', error);
            res.status(500).json({ message: 'Error getting team availability summary' });
        }
    }
}
exports.AdvancedSchedulingController = AdvancedSchedulingController;
// Import pool for database operations
const database_1 = require("../config/database");
