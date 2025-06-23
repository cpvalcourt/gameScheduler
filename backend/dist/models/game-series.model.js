"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSeriesModel = void 0;
const database_1 = require("../config/database");
class GameSeriesModel {
    static async create(series) {
        const [result] = await database_1.pool.execute('INSERT INTO GAME_SERIES (NAME, DESCRIPTION, TYPE, START_DATE, END_DATE, CREATED_BY) VALUES (?, ?, ?, ?, ?, ?)', [series.name, series.description, series.type, series.start_date, series.end_date, series.created_by]);
        const [rows] = await database_1.pool.execute('SELECT * FROM GAME_SERIES WHERE ID = ?', [result.insertId]);
        const results = rows;
        if (!results.length) {
            throw new Error('Failed to create game series');
        }
        return {
            id: results[0].ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            type: results[0].TYPE,
            start_date: results[0].START_DATE,
            end_date: results[0].END_DATE,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async findById(id) {
        const [rows] = await database_1.pool.execute('SELECT * FROM GAME_SERIES WHERE ID = ?', [id]);
        const results = rows;
        if (!results.length) {
            return null;
        }
        return {
            id: results[0].ID,
            name: results[0].NAME,
            description: results[0].DESCRIPTION,
            type: results[0].TYPE,
            start_date: results[0].START_DATE,
            end_date: results[0].END_DATE,
            created_by: results[0].CREATED_BY,
            created_at: results[0].CREATED_AT,
            updated_at: results[0].UPDATED_AT
        };
    }
    static async update(id, updates) {
        const setClause = Object.keys(updates)
            .map(key => `${key.toUpperCase()} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];
        await database_1.pool.execute(`UPDATE GAME_SERIES SET ${setClause} WHERE ID = ?`, values);
        return this.findById(id);
    }
    static async delete(id) {
        // First get all games in this series
        const [games] = await database_1.pool.execute('SELECT ID FROM GAMES WHERE SERIES_ID = ?', [id]);
        // Delete each game (which will also delete related records)
        for (const game of games) {
            await database_1.pool.execute('DELETE FROM GAME_ATTENDANCE WHERE GAME_ID = ?', [game.ID]);
            await database_1.pool.execute('DELETE FROM GAME_TEAMS WHERE GAME_ID = ?', [game.ID]);
            await database_1.pool.execute('DELETE FROM GAMES WHERE ID = ?', [game.ID]);
        }
        // Then delete the series
        const [result] = await database_1.pool.execute('DELETE FROM GAME_SERIES WHERE ID = ?', [id]);
        return result.affectedRows > 0;
    }
    static async getUserSeries(userId) {
        const [rows] = await database_1.pool.execute('SELECT * FROM GAME_SERIES WHERE CREATED_BY = ?', [userId]);
        return rows.map(row => ({
            id: row.ID,
            name: row.NAME,
            description: row.DESCRIPTION,
            type: row.TYPE,
            start_date: row.START_DATE,
            end_date: row.END_DATE,
            created_by: row.CREATED_BY,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT
        }));
    }
    static async isOwner(seriesId, userId) {
        const [rows] = await database_1.pool.execute('SELECT 1 FROM GAME_SERIES WHERE ID = ? AND CREATED_BY = ?', [seriesId, userId]);
        return rows.length > 0;
    }
}
exports.GameSeriesModel = GameSeriesModel;
