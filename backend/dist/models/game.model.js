"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = void 0;
const database_1 = require("../config/database");
class GameModel {
    static async create(game) {
        const [result] = await database_1.pool.execute(`INSERT INTO GAMES (
                SERIES_ID, NAME, DESCRIPTION, SPORT_TYPE, DATE, TIME, 
                LOCATION, MIN_PLAYERS, MAX_PLAYERS, STATUS, CREATED_BY
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            game.series_id,
            game.name,
            game.description,
            game.sport_type,
            game.date,
            game.time,
            game.location,
            game.min_players,
            game.max_players,
            game.status,
            game.created_by
        ]);
        const [rows] = await database_1.pool.execute("SELECT * FROM GAMES WHERE ID = ?", [result.insertId]);
        const results = rows;
        return {
            id: results[0].ID,
            series_id: results[0].SERIES_ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            sport_type: results[0].SPORT_TYPE,
            date: results[0].DATE,
            time: results[0].TIME,
            location: results[0].LOCATION,
            min_players: results[0].MIN_PLAYERS,
            max_players: results[0].MAX_PLAYERS,
            status: results[0].STATUS,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async findById(id) {
        const [rows] = await database_1.pool.execute('SELECT * FROM GAMES WHERE ID = ?', [id]);
        const results = rows;
        if (!results.length) {
            return null;
        }
        return {
            id: results[0].ID,
            series_id: results[0].SERIES_ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            sport_type: results[0].SPORT_TYPE,
            date: results[0].DATE,
            time: results[0].TIME,
            location: results[0].LOCATION,
            min_players: results[0].MIN_PLAYERS,
            max_players: results[0].MAX_PLAYERS,
            status: results[0].STATUS,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async update(id, updates) {
        const game = await this.findById(id);
        if (!game) {
            return null;
        }
        const setClause = Object.keys(updates)
            .map(key => `${key.toUpperCase()} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];
        await database_1.pool.execute(`UPDATE GAMES SET ${setClause}, UPDATED_AT = NOW() WHERE ID = ?`, values);
        return this.findById(id);
    }
    static async delete(id) {
        // First delete related records
        await database_1.pool.execute('DELETE FROM GAME_ATTENDANCE WHERE GAME_ID = ?', [id]);
        await database_1.pool.execute('DELETE FROM GAME_TEAMS WHERE GAME_ID = ?', [id]);
        // Then delete the game
        const [result] = await database_1.pool.execute('DELETE FROM GAMES WHERE ID = ?', [id]);
        return result.affectedRows > 0;
    }
    static async addTeam(gameId, teamId) {
        const [result] = await database_1.pool.execute('INSERT INTO GAME_TEAMS (GAME_ID, TEAM_ID) VALUES (?, ?)', [gameId, teamId]);
        const [rows] = await database_1.pool.execute('SELECT * FROM GAME_TEAMS WHERE ID = ?', [result.insertId]);
        const results = rows;
        if (!results.length) {
            throw new Error('Failed to add team to game');
        }
        return {
            id: results[0].ID,
            game_id: results[0].GAME_ID,
            team_id: results[0].TEAM_ID,
            created_at: results[0].CREATED_AT
        };
    }
    static async removeTeam(gameId, teamId) {
        const [result] = await database_1.pool.execute('DELETE FROM GAME_TEAMS WHERE GAME_ID = ? AND TEAM_ID = ?', [gameId, teamId]);
        return result.affectedRows > 0;
    }
    static async getGameTeams(gameId) {
        const query = `
            SELECT t.TEAM_ID, t.NAME, t.CREATED_AT
            FROM GAME_TEAMS gt
            JOIN TEAMS t ON gt.TEAM_ID = t.TEAM_ID
            WHERE gt.GAME_ID = ?
            ORDER BY t.CREATED_AT DESC
        `;
        const [rows] = await database_1.pool.query(query, [gameId]);
        return rows;
    }
    static async updateAttendance(gameId, userId, status, notes) {
        const [result] = await database_1.pool.execute('INSERT INTO GAME_ATTENDANCE (GAME_ID, USER_ID, STATUS, NOTES) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE STATUS = ?, NOTES = ?', [gameId, userId, status, notes, status, notes]);
        const [rows] = await database_1.pool.execute('SELECT * FROM GAME_ATTENDANCE WHERE GAME_ID = ? AND USER_ID = ?', [gameId, userId]);
        const results = rows;
        if (!results.length) {
            throw new Error('Failed to update attendance');
        }
        return {
            id: results[0].ID,
            game_id: results[0].GAME_ID,
            user_id: results[0].USER_ID,
            status: results[0].STATUS,
            notes: results[0].NOTES,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async getGameAttendance(gameId) {
        const query = `
            SELECT USER_ID, STATUS, CREATED_AT
            FROM GAME_ATTENDANCE
            WHERE GAME_ID = ?
            ORDER BY CREATED_AT DESC
        `;
        const [rows] = await database_1.pool.query(query, [gameId]);
        return rows;
    }
    static async getUserGames(userId) {
        const [rows] = await database_1.pool.execute(`SELECT DISTINCT g.* 
             FROM GAMES g
             LEFT JOIN GAME_TEAMS gt ON g.ID = gt.GAME_ID
             LEFT JOIN TEAM_MEMBERS tm ON gt.TEAM_ID = tm.TEAM_ID
             WHERE g.CREATED_BY = ? OR tm.USER_ID = ?`, [userId, userId]);
        return rows.map(row => ({
            id: row.ID,
            series_id: row.SERIES_ID,
            name: row.NAME,
            description: row.DESCRIPTION,
            sport_type: row.SPORT_TYPE,
            date: row.DATE,
            time: row.TIME,
            location: row.LOCATION,
            min_players: row.MIN_PLAYERS,
            max_players: row.MAX_PLAYERS,
            status: row.STATUS,
            created_by: row.CREATED_BY,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT
        }));
    }
    static async getSeriesGames(seriesId) {
        const [rows] = await database_1.pool.execute('SELECT * FROM GAMES WHERE SERIES_ID = ? ORDER BY DATE, TIME', [seriesId]);
        return rows.map(row => ({
            id: row.ID,
            series_id: row.SERIES_ID,
            name: row.NAME,
            description: row.DESCRIPTION,
            sport_type: row.SPORT_TYPE,
            date: row.DATE,
            time: row.TIME,
            location: row.LOCATION,
            min_players: row.MIN_PLAYERS,
            max_players: row.MAX_PLAYERS,
            status: row.STATUS,
            created_by: row.CREATED_BY,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT
        }));
    }
    static async search(params) {
        const conditions = [];
        const values = [];
        if (params.seriesId) {
            conditions.push('SERIES_ID = ?');
            values.push(params.seriesId);
        }
        if (params.status) {
            conditions.push('STATUS = ?');
            values.push(params.status);
        }
        if (params.sportType) {
            conditions.push('SPORT_TYPE = ?');
            values.push(params.sportType);
        }
        if (params.startDate) {
            conditions.push('DATE >= ?');
            values.push(params.startDate);
        }
        if (params.endDate) {
            conditions.push('DATE <= ?');
            values.push(params.endDate);
        }
        if (params.location) {
            conditions.push('LOCATION LIKE ?');
            values.push(`%${params.location}%`);
        }
        if (params.minPlayers) {
            conditions.push('MIN_PLAYERS >= ?');
            values.push(params.minPlayers);
        }
        if (params.maxPlayers) {
            conditions.push('MAX_PLAYERS <= ?');
            values.push(params.maxPlayers);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const query = `
            SELECT * FROM GAMES
            ${whereClause}
            ORDER BY DATE ASC, TIME ASC
        `;
        const [rows] = await database_1.pool.query(query, values);
        return rows;
    }
}
exports.GameModel = GameModel;
