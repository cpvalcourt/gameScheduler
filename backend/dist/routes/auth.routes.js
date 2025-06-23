"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation middleware
const registerValidation = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
const requestPasswordResetValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
const verifyEmailValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Verification token is required')
];
const resendVerificationValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email')
];
// Routes
router.post('/register', registerValidation, auth_controller_1.AuthController.register);
router.post('/login', loginValidation, auth_controller_1.AuthController.login);
router.post('/request-password-reset', requestPasswordResetValidation, auth_controller_1.AuthController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, auth_controller_1.AuthController.resetPassword);
router.get('/verify-email/:token', auth_controller_1.AuthController.verifyEmail);
router.post('/resend-verification', resendVerificationValidation, auth_controller_1.AuthController.resendVerificationEmail);
exports.default = router;
