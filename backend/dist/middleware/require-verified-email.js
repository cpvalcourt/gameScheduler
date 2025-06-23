"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedEmail = void 0;
const user_model_1 = require("../models/user.model");
const requireVerifiedEmail = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = await user_model_1.UserModel.findById(req.user.id);
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
    }
    catch (error) {
        console.error('Error checking email verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireVerifiedEmail = requireVerifiedEmail;
