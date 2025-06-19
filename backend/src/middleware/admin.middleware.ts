import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const requireModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'admin' && user.role !== 'moderator') {
            return res.status(403).json({ message: 'Moderator access required' });
        }

        next();
    } catch (error) {
        console.error('Moderator middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 