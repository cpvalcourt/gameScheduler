"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModerator = exports.requireAdmin = void 0;
const user_model_1 = require("../models/user.model");
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = await user_model_1.UserModel.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireAdmin = requireAdmin;
const requireModerator = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = await user_model_1.UserModel.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'admin' && user.role !== 'moderator') {
            return res.status(403).json({ message: 'Moderator access required' });
        }
        next();
    }
    catch (error) {
        console.error('Moderator middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireModerator = requireModerator;
