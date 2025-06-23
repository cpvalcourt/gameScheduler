"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const user_model_1 = require("../models/user.model");
class AdminController {
    static async getUsers(req, res) {
        try {
            console.log('Admin getUsers called with query:', req.query);
            console.log('User from request:', req.user);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                role: req.query.role,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                is_verified: req.query.is_verified !== undefined ? req.query.is_verified === 'true' : undefined,
                search: req.query.search
            };
            console.log('Calling UserModel.findAll with:', { page, limit, filters });
            const result = await user_model_1.UserModel.findAll(page, limit, filters);
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
        }
        catch (error) {
            console.error('Get users error details:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            res.status(500).json({ message: 'Error fetching users', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    static async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await user_model_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Remove sensitive information
            const { password, verification_token, ...userResponse } = user;
            res.json(userResponse);
        }
        catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Error fetching user' });
        }
    }
    static async updateUserRole(req, res) {
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
            const updatedUser = await user_model_1.UserModel.updateRole(userId, role);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({ message: 'User role updated successfully', user: userResponse });
        }
        catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ message: 'Error updating user role' });
        }
    }
    static async toggleUserStatus(req, res) {
        try {
            const userId = parseInt(req.params.id);
            // Prevent admin from deactivating themselves
            if (req.user?.id === userId) {
                return res.status(400).json({ message: 'Cannot deactivate your own account' });
            }
            const updatedUser = await user_model_1.UserModel.toggleActiveStatus(userId);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({
                message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
                user: userResponse
            });
        }
        catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    }
    static async updateAdminNotes(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { notes } = req.body;
            const updatedUser = await user_model_1.UserModel.updateAdminNotes(userId, notes);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { password, verification_token, ...userResponse } = updatedUser;
            res.json({ message: 'Admin notes updated successfully', user: userResponse });
        }
        catch (error) {
            console.error('Update admin notes error:', error);
            res.status(500).json({ message: 'Error updating admin notes' });
        }
    }
    static async bulkUpdateRoles(req, res) {
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
            const affectedRows = await user_model_1.UserModel.bulkUpdateRole(userIds, role);
            res.json({
                message: `Updated role for ${affectedRows} users successfully`,
                affectedRows
            });
        }
        catch (error) {
            console.error('Bulk update roles error:', error);
            res.status(500).json({ message: 'Error updating user roles' });
        }
    }
    static async bulkToggleStatus(req, res) {
        try {
            const { userIds, isActive } = req.body;
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: 'User IDs array is required' });
            }
            // Prevent admin from deactivating themselves
            if (userIds.includes(req.user?.id) && !isActive) {
                return res.status(400).json({ message: 'Cannot deactivate your own account' });
            }
            const affectedRows = await user_model_1.UserModel.bulkToggleActiveStatus(userIds, isActive);
            res.json({
                message: `${isActive ? 'Activated' : 'Deactivated'} ${affectedRows} users successfully`,
                affectedRows
            });
        }
        catch (error) {
            console.error('Bulk toggle status error:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    }
    static async getStats(req, res) {
        try {
            const stats = await user_model_1.UserModel.getStats();
            res.json(stats);
        }
        catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ message: 'Error fetching statistics' });
        }
    }
}
exports.AdminController = AdminController;
