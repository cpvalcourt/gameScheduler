import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();

// Validation middleware
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const requestPasswordResetValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const verifyEmailValidation = [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required')
];

const resendVerificationValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
];

// Routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/request-password-reset', requestPasswordResetValidation, AuthController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', resendVerificationValidation, AuthController.resendVerificationEmail);

export default router; 