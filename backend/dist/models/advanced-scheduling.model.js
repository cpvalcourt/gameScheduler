"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSchedulingModel = void 0;
const database_1 = require("../config/database");
class AdvancedSchedulingModel {
    // Recurring Pattern Methods
    static async createRecurringPattern(pattern) {
        const [result] = await database_1.pool.execute(`INSERT INTO RECURRING_PATTERNS (
                SERIES_ID, NAME, DESCRIPTION, FREQUENCY, \`INTERVAL\`, DAY_OF_WEEK,
                START_TIME, END_TIME, LOCATION, MIN_PLAYERS, MAX_PLAYERS,
                START_DATE, END_DATE, IS_ACTIVE, CREATED_BY
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            pattern.series_id,
            pattern.name,
            pattern.description,
            pattern.frequency,
            pattern.interval,
            pattern.day_of_week,
            pattern.start_time,
            pattern.end_time,
            pattern.location,
            pattern.min_players,
            pattern.max_players,
            pattern.start_date,
            pattern.end_date,
            pattern.is_active,
            pattern.created_by
        ]);
        const [rows] = await database_1.pool.execute('SELECT * FROM RECURRING_PATTERNS WHERE ID = ?', [result.insertId]);
        const results = rows;
        return {
            id: results[0].ID,
            series_id: results[0].SERIES_ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            frequency: results[0].FREQUENCY,
            interval: results[0]['INTERVAL'],
            day_of_week: results[0].DAY_OF_WEEK,
            start_time: results[0].START_TIME,
            end_time: results[0].END_TIME,
            location: results[0].LOCATION,
            min_players: results[0].MIN_PLAYERS,
            max_players: results[0].MAX_PLAYERS,
            start_date: results[0].START_DATE,
            end_date: results[0].END_DATE,
            is_active: results[0].IS_ACTIVE,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async generateGamesFromPattern(patternId, startDate, endDate) {
        const pattern = await this.getRecurringPattern(patternId);
        if (!pattern) {
            throw new Error('Recurring pattern not found');
        }
        const generatedGameIds = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            // Check if this date matches the pattern
            if (currentDate.getDay() === pattern.day_of_week) {
                // Create game for this date
                const gameData = {
                    series_id: pattern.series_id,
                    name: `${pattern.name} - ${currentDate.toLocaleDateString()}`,
                    description: pattern.description,
                    sport_type: 'Basketball', // Default, should be configurable
                    date: currentDate.toISOString().split('T')[0],
                    time: pattern.start_time,
                    location: pattern.location,
                    min_players: pattern.min_players,
                    max_players: pattern.max_players,
                    status: 'scheduled',
                    created_by: pattern.created_by
                };
                // Import GameModel to create the game
                const { GameModel } = await Promise.resolve().then(() => __importStar(require('./game.model')));
                const game = await GameModel.create(gameData);
                generatedGameIds.push(game.id);
                // Move to next occurrence based on frequency
                switch (pattern.frequency) {
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case 'bi_weekly':
                        currentDate.setDate(currentDate.getDate() + 14);
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    case 'custom':
                        currentDate.setDate(currentDate.getDate() + (pattern.interval * 7));
                        break;
                }
            }
            else {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        return generatedGameIds;
    }
    static async getRecurringPattern(patternId) {
        const [rows] = await database_1.pool.execute('SELECT * FROM RECURRING_PATTERNS WHERE ID = ?', [patternId]);
        const results = rows;
        if (!results.length) {
            return null;
        }
        return {
            id: results[0].ID,
            series_id: results[0].SERIES_ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            frequency: results[0].FREQUENCY,
            interval: results[0]['INTERVAL'],
            day_of_week: results[0].DAY_OF_WEEK,
            start_time: results[0].START_TIME,
            end_time: results[0].END_TIME,
            location: results[0].LOCATION,
            min_players: results[0].MIN_PLAYERS,
            max_players: results[0].MAX_PLAYERS,
            start_date: results[0].START_DATE,
            end_date: results[0].END_DATE,
            is_active: results[0].IS_ACTIVE,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    // Player Availability Methods
    static async setPlayerAvailability(availability) {
        // Check if availability already exists for this user/date/time
        const [existing] = await database_1.pool.execute('SELECT ID FROM PLAYER_AVAILABILITY WHERE USER_ID = ? AND DATE = ? AND TIME_SLOT = ?', [availability.user_id, availability.date, availability.time_slot]);
        if (existing.length > 0) {
            // Update existing
            await database_1.pool.execute('UPDATE PLAYER_AVAILABILITY SET STATUS = ?, NOTES = ?, UPDATED_AT = NOW() WHERE USER_ID = ? AND DATE = ? AND TIME_SLOT = ?', [availability.status, availability.notes, availability.user_id, availability.date, availability.time_slot]);
        }
        else {
            // Create new
            await database_1.pool.execute('INSERT INTO PLAYER_AVAILABILITY (USER_ID, DATE, TIME_SLOT, STATUS, NOTES) VALUES (?, ?, ?, ?, ?)', [availability.user_id, availability.date, availability.time_slot, availability.status, availability.notes]);
        }
        const [rows] = await database_1.pool.execute('SELECT * FROM PLAYER_AVAILABILITY WHERE USER_ID = ? AND DATE = ? AND TIME_SLOT = ?', [availability.user_id, availability.date, availability.time_slot]);
        const results = rows;
        return {
            id: results[0].ID,
            user_id: results[0].USER_ID,
            date: results[0].DATE,
            time_slot: results[0].TIME_SLOT,
            status: results[0].STATUS,
            notes: results[0].NOTES,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async getPlayerAvailability(userId, startDate, endDate) {
        const [rows] = await database_1.pool.execute('SELECT * FROM PLAYER_AVAILABILITY WHERE USER_ID = ? AND DATE BETWEEN ? AND ? ORDER BY DATE, TIME_SLOT', [userId, startDate, endDate]);
        return rows.map(row => ({
            id: row.ID,
            user_id: row.USER_ID,
            date: row.DATE,
            time_slot: row.TIME_SLOT,
            status: row.STATUS,
            notes: row.NOTES,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT
        }));
    }
    // Conflict Detection Methods
    static async detectConflicts(gameId) {
        const conflicts = [];
        // Get game details
        const { GameModel } = await Promise.resolve().then(() => __importStar(require('./game.model')));
        const game = await GameModel.findById(gameId);
        if (!game) {
            return conflicts;
        }
        // Check for time overlaps
        const timeConflicts = await this.checkTimeConflicts(game);
        conflicts.push(...timeConflicts);
        // Check for location conflicts
        const locationConflicts = await this.checkLocationConflicts(game);
        conflicts.push(...locationConflicts);
        // Check for player availability conflicts
        const availabilityConflicts = await this.checkAvailabilityConflicts(game);
        conflicts.push(...availabilityConflicts);
        return conflicts;
    }
    static async checkTimeConflicts(game) {
        const [rows] = await database_1.pool.execute(`SELECT g.ID, g.NAME, g.DATE, g.TIME, g.LOCATION
             FROM GAMES g
             WHERE g.DATE = ? AND g.TIME = ? AND g.ID != ?`, [game.date, game.time, game.id]);
        const conflicts = [];
        for (const row of rows) {
            conflicts.push({
                id: 0, // Will be set when saved
                game_id: game.id,
                conflict_type: 'time_overlap',
                conflict_details: `Time conflict with game: ${row.NAME} at ${row.LOCATION}`,
                severity: 'high',
                resolved: false,
                created_at: new Date(),
                resolved_at: new Date()
            });
        }
        return conflicts;
    }
    static async checkLocationConflicts(game) {
        const [rows] = await database_1.pool.execute(`SELECT g.ID, g.NAME, g.DATE, g.TIME
             FROM GAMES g
             WHERE g.LOCATION = ? AND g.DATE = ? AND g.ID != ?`, [game.location, game.date, game.id]);
        const conflicts = [];
        for (const row of rows) {
            conflicts.push({
                id: 0,
                game_id: game.id,
                conflict_type: 'location_conflict',
                conflict_details: `Location conflict with game: ${row.NAME} at ${row.TIME}`,
                severity: 'critical',
                resolved: false,
                created_at: new Date(),
                resolved_at: new Date()
            });
        }
        return conflicts;
    }
    static async checkAvailabilityConflicts(game) {
        // Get team members for this game
        const [teamMembers] = await database_1.pool.execute(`SELECT DISTINCT tm.USER_ID
             FROM GAME_TEAMS gt
             JOIN TEAM_MEMBERS tm ON gt.TEAM_ID = tm.TEAM_ID
             WHERE gt.GAME_ID = ?`, [game.id]);
        const conflicts = [];
        for (const member of teamMembers) {
            const [availability] = await database_1.pool.execute('SELECT STATUS FROM PLAYER_AVAILABILITY WHERE USER_ID = ? AND DATE = ? AND TIME_SLOT LIKE ?', [member.USER_ID, game.date, `${game.time}%`]);
            if (availability.length > 0 && availability[0].STATUS === 'unavailable') {
                conflicts.push({
                    id: 0,
                    game_id: game.id,
                    conflict_type: 'player_unavailable',
                    conflict_details: `Player ${member.USER_ID} is unavailable for this time slot`,
                    severity: 'medium',
                    resolved: false,
                    created_at: new Date(),
                    resolved_at: new Date()
                });
            }
        }
        return conflicts;
    }
    // Smart Scheduling Methods
    static async findOptimalTimeSlot(seriesId, date, duration, // in minutes
    minPlayers, maxPlayers) {
        const timeSlots = this.generateTimeSlots(date, duration);
        let bestSlot = null;
        for (const timeSlot of timeSlots) {
            const availability = await this.checkTeamAvailability(seriesId, date, timeSlot);
            const conflicts = await this.countConflicts(date, timeSlot);
            if (availability >= minPlayers && (!bestSlot || availability > bestSlot.availablePlayers)) {
                bestSlot = {
                    time: timeSlot,
                    availablePlayers: availability,
                    conflicts
                };
            }
        }
        return bestSlot;
    }
    static generateTimeSlots(date, duration) {
        const slots = [];
        const startHour = 8; // 8 AM
        const endHour = 22; // 10 PM
        for (let hour = startHour; hour <= endHour - Math.ceil(duration / 60); hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endHour = hour + Math.ceil(duration / 60);
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;
            slots.push(`${startTime}-${endTime}`);
        }
        return slots;
    }
    static async checkTeamAvailability(seriesId, date, timeSlot) {
        const [rows] = await database_1.pool.execute(`SELECT COUNT(DISTINCT tm.USER_ID) as available_count
             FROM GAME_SERIES gs
             JOIN GAME_TEAMS gt ON gs.ID = gt.GAME_ID
             JOIN TEAM_MEMBERS tm ON gt.TEAM_ID = tm.TEAM_ID
             LEFT JOIN PLAYER_AVAILABILITY pa ON tm.USER_ID = pa.USER_ID 
                AND pa.DATE = ? AND pa.TIME_SLOT = ?
             WHERE gs.ID = ? AND (pa.STATUS IS NULL OR pa.STATUS != 'unavailable')`, [date, timeSlot, seriesId]);
        return rows[0]?.available_count || 0;
    }
    static async countConflicts(date, timeSlot) {
        const [rows] = await database_1.pool.execute('SELECT COUNT(*) as conflict_count FROM GAMES WHERE DATE = ? AND TIME = ?', [date, timeSlot.split('-')[0]]);
        return rows[0]?.conflict_count || 0;
    }
    // Weather Forecast Methods
    static async createWeatherForecast(forecast) {
        const [result] = await database_1.pool.execute(`INSERT INTO WEATHER_FORECASTS (
                LOCATION, DATE, TEMPERATURE, \`CONDITION\`, WIND_SPEED, 
                PRECIPITATION_CHANCE, IS_SUITABLE_FOR_SPORT
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            forecast.location,
            forecast.date,
            forecast.temperature,
            forecast.condition,
            forecast.wind_speed,
            forecast.precipitation_chance,
            forecast.is_suitable_for_sport
        ]);
        const [rows] = await database_1.pool.execute('SELECT * FROM WEATHER_FORECASTS WHERE ID = ?', [result.insertId]);
        const results = rows;
        return {
            id: results[0].ID,
            location: results[0].LOCATION,
            date: results[0].DATE,
            temperature: results[0].TEMPERATURE,
            condition: results[0]['CONDITION'],
            wind_speed: results[0].WIND_SPEED,
            precipitation_chance: results[0].PRECIPITATION_CHANCE,
            is_suitable_for_sport: results[0].IS_SUITABLE_FOR_SPORT,
            created_at: results[0].CREATED_AT
        };
    }
}
exports.AdvancedSchedulingModel = AdvancedSchedulingModel;
