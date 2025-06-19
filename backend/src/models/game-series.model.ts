import { pool } from '../config/database';

export interface GameSeries {
    id: number;
    name: string;
    description: string | null;
    type: 'tournament' | 'league' | 'casual';
    start_date: Date;
    end_date: Date;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}

export class GameSeriesModel {
    static async create(series: Omit<GameSeries, 'id' | 'created_at' | 'updated_at'>): Promise<GameSeries> {
        const [result] = await pool.execute(
            'INSERT INTO GAME_SERIES (NAME, DESCRIPTION, TYPE, START_DATE, END_DATE, CREATED_BY) VALUES (?, ?, ?, ?, ?, ?)',
            [series.name, series.description, series.type, series.start_date, series.end_date, series.created_by]
        );

        const [rows] = await pool.execute(
            'SELECT * FROM GAME_SERIES WHERE ID = ?',
            [(result as any).insertId]
        );

        const results = rows as any[];
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

    static async findById(id: number): Promise<GameSeries | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM GAME_SERIES WHERE ID = ?',
            [id]
        );

        const results = rows as any[];
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

    static async update(id: number, updates: Partial<Omit<GameSeries, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Promise<GameSeries | null> {
        const setClause = Object.keys(updates)
            .map(key => `${key.toUpperCase()} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];

        await pool.execute(
            `UPDATE GAME_SERIES SET ${setClause} WHERE ID = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        // First get all games in this series
        const [games] = await pool.execute(
            'SELECT ID FROM GAMES WHERE SERIES_ID = ?',
            [id]
        );

        // Delete each game (which will also delete related records)
        for (const game of games as any[]) {
            await pool.execute('DELETE FROM GAME_ATTENDANCE WHERE GAME_ID = ?', [game.ID]);
            await pool.execute('DELETE FROM GAME_TEAMS WHERE GAME_ID = ?', [game.ID]);
            await pool.execute('DELETE FROM GAMES WHERE ID = ?', [game.ID]);
        }

        // Then delete the series
        const [result] = await pool.execute(
            'DELETE FROM GAME_SERIES WHERE ID = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }

    static async getUserSeries(userId: number): Promise<GameSeries[]> {
        const [rows] = await pool.execute(
            'SELECT * FROM GAME_SERIES WHERE CREATED_BY = ?',
            [userId]
        );

        return (rows as any[]).map(row => ({
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

    static async isOwner(seriesId: number, userId: number): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT 1 FROM GAME_SERIES WHERE ID = ? AND CREATED_BY = ?',
            [seriesId, userId]
        );
        return (rows as any[]).length > 0;
    }
} 