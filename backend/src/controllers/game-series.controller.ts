import { Request, Response } from 'express';
import { GameSeriesModel } from '../models/game-series.model';

export class GameSeriesController {
    static async createSeries(req: Request, res: Response) {
        try {
            console.log('Creating game series with body:', req.body);
            const { name, description, type, start_date, end_date } = req.body;
            const user = req.user;

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            console.log('User ID:', user.id);
            console.log('Creating series with data:', { name, description, type, start_date, end_date, created_by: user.id });

            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ message: 'Series name is required' });
            }

            const series = await GameSeriesModel.create({
                name,
                description,
                type,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                created_by: user.id
            });

            console.log('Created series:', series);

            res.status(201).json({ message: 'Series created successfully', series });
        } catch (error) {
            console.error('Error creating game series:', error);
            res.status(500).json({ message: 'Error creating game series' });
        }
    }

    static async getSeries(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const seriesId = parseInt(id);

            const series = await GameSeriesModel.findById(seriesId);
            if (!series) {
                return res.status(404).json({ message: 'Series not found' });
            }

            res.json(series);
        } catch (error) {
            console.error('Error getting game series:', error);
            res.status(500).json({ message: 'Error getting game series' });
        }
    }

    static async updateSeries(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, type, start_date, end_date } = req.body;
            const user = req.user;
            const seriesId = parseInt(id);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isOwner = await GameSeriesModel.isOwner(seriesId, user.id);
            if (!isOwner) {
                return res.status(403).json({ message: 'Only the series owner can update the series' });
            }

            const series = await GameSeriesModel.update(seriesId, { name, description, type, start_date, end_date });
            if (!series) {
                return res.status(404).json({ message: 'Series not found' });
            }

            res.json({
                message: 'Series updated successfully',
                series
            });
        } catch (error) {
            console.error('Error updating series:', error);
            res.status(500).json({ message: 'Error updating series' });
        }
    }

    static async deleteSeries(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = req.user;
            const seriesId = parseInt(id);

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const isOwner = await GameSeriesModel.isOwner(seriesId, user.id);
            if (!isOwner) {
                return res.status(403).json({ message: 'Only the series owner can delete the series' });
            }

            await GameSeriesModel.delete(seriesId);
            res.json({ message: 'Series deleted successfully' });
        } catch (error) {
            console.error('Error deleting series:', error);
            res.status(500).json({ message: 'Error deleting series' });
        }
    }

    static async getUserSeries(req: Request, res: Response) {
        try {
            const user = req.user;

            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const series = await GameSeriesModel.getUserSeries(user.id);
            res.json(series);
        } catch (error) {
            console.error('Error getting user game series:', error);
            res.status(500).json({ message: 'Error getting user game series' });
        }
    }
} 