"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await user_model_1.UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.authenticateToken = authenticateToken;
