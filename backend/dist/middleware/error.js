"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_1 = require("../utils/app-error");
const errorHandler = (err, req, res, next) => {
    if (err instanceof app_error_1.AppError) {
        return res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: err.message,
            errors: err.errors
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
