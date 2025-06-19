import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

export class AdminController {
    static async getUsers(req: Request, res: Response) {
        try {
            console.log('Admin getUsers called with query:', req.query);
            console.log('User from request:', req.user);
            
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filters = {
                role: req.query.role as string,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                is_verified: req.query.is_verified !== undefined ? req.query.is_verified === 'true' : undefined,
                search: req.query.search as string
            };

            console.log('Calling UserModel.findAll with:', { page, limit, filters });
            const result = await UserModel.findAll(page, limit, filters);
            console.log('UserModel.findAll result:', result);
            
            res.json({
                users: result.users,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            console.error('Get users error details:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            res.status(500).json({ message: 'Error fetching users', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Remove sensitive information
            const { password, verification_token, ...userResponse } = user;
            res.json(userResponse);
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Error fetching user' });
        }
    }

    static async updateUserRole(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const { role } = req.body;

            if (!['user', 'moderator', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Prevent admin from removing their own admin role
            if (req.user?.id === userId && role !== 'admin') {
                return res.status(400).json({ message: 'Cannot change your own role' });
            }

            const updatedUser = await UserModel.updateRole(userId, role);
            
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({ message: 'User role updated successfully', user: userResponse });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ message: 'Error updating user role' });
        }
    }

    static async toggleUserStatus(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);

            // Prevent admin from deactivating themselves
            if (req.user?.id === userId) {
                return res.status(400).json({ message: 'Cannot deactivate your own account' });
            }

            const updatedUser = await UserModel.toggleActiveStatus(userId);
            
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({ 
                message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`, 
                user: userResponse 
            });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    }

    static async updateAdminNotes(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const { notes } = req.body;

            const updatedUser = await UserModel.updateAdminNotes(userId, notes);
            
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({ message: 'Admin notes updated successfully', user: userResponse });
        } catch (error) {
            console.error('Update admin notes error:', error);
            res.status(500).json({ message: 'Error updating admin notes' });
        }
    }

    static async bulkUpdateRoles(req: Request, res: Response) {
        try {
            const { userIds, role } = req.body;

            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: 'User IDs array is required' });
            }

            if (!['user', 'moderator', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Prevent admin from removing their own admin role
            if (userIds.includes(req.user?.id) && role !== 'admin') {
                return res.status(400).json({ message: 'Cannot change your own role' });
            }

            const affectedRows = await UserModel.bulkUpdateRole(userIds, role);
            
            res.json({ 
                message: `Updated role for ${affectedRows} users successfully`,
                affectedRows 
            });
        } catch (error) {
            console.error('Bulk update roles error:', error);
            res.status(500).json({ message: 'Error updating user roles' });
        }
    }

    static async bulkToggleStatus(req: Request, res: Response) {
        try {
            const { userIds, isActive } = req.body;

            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: 'User IDs array is required' });
            }

            // Prevent admin from deactivating themselves
            if (userIds.includes(req.user?.id) && !isActive) {
                return res.status(400).json({ message: 'Cannot deactivate your own account' });
            }

            const affectedRows = await UserModel.bulkToggleActiveStatus(userIds, isActive);
            
            res.json({ 
                message: `${isActive ? 'Activated' : 'Deactivated'} ${affectedRows} users successfully`,
                affectedRows 
            });
        } catch (error) {
            console.error('Bulk toggle status error:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    }

    static async getStats(req: Request, res: Response) {
        try {
            const stats = await UserModel.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ message: 'Error fetching statistics' });
        }
    }
} 