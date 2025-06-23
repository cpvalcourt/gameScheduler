"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const env_1 = __importDefault(require("../config/env"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        console.log('JWT_SECRET used for verification:', env_1.default.JWT_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        const user = await user_model_1.UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const payload = {
            id: user.id,
            email: user.email
        };
        req.user = {
            id: user.id,
            email: user.email
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.authenticate = authenticate;
