import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';

export const requireVerifiedEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ 
                message: 'Email verification required',
                isVerified: false
            });
        }

        next();
    } catch (error) {
        console.error('Error checking email verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 