import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, User } from '../models/user.model';
import { PasswordResetModel } from '../models/password-reset.model';
import config from '../config/env';
import nodemailer from 'nodemailer';
import { pool } from '../config/database';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            // Check if username is taken
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username is already taken' });
            }

            // Create user
            const user = await UserModel.create(username, email, password);

            // Generate JWT token
            const signOptions: SignOptions = {
                expiresIn: '24h'
            };

            const token = jwt.sign(
                { id: user.id, email: user.email },
                config.JWT_SECRET,
                signOptions
            );

            // Send verification email
            const verificationLink = `${config.FRONTEND_URL}/verify-email/${user.verification_token}`;
            
            // Configure email transporter
            const transporter = nodemailer.createTransport({
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                secure: config.SMTP_PORT === 465,
                auth: {
                    user: config.SMTP_USER,
                    pass: config.SMTP_PASS
                }
            });

            // Send verification email
            await transporter.sendMail({
                from: config.SMTP_USER,
                to: user.email,
                subject: 'Verify Your Email',
                html: `
                    <p>Welcome to Game Scheduler!</p>
                    <p>Please click this <a href="${verificationLink}">link</a> to verify your email address.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                `
            });

            // Return user data without password
            const { password: _password, ...userWithoutPassword } = user;
            res.status(201).json({
                message: 'User registered successfully. Please check your email to verify your account.',
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            console.log('Login attempt for email:', email);

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                console.log('User not found for email:', email);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            console.log('User found:', { id: user.id, email: user.email });

            // Verify password
            const isValidPassword = await UserModel.verifyPassword(password, user.password);
            console.log('Password verification result:', isValidPassword);

            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const signOptions: SignOptions = {
                expiresIn: '24h'
            };

            console.log('JWT_SECRET used for signing:', config.JWT_SECRET);

            const token = jwt.sign(
                { id: user.id, email: user.email },
                config.JWT_SECRET,
                signOptions
            );

            // Return user data without password
            const { password: _password, ...userWithoutPassword } = user;
            res.json({
                message: 'Login successful',
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            console.error('Login error details:', error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }

    static async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body;
            console.log('Password reset request for email:', email);

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                console.log('User not found for password reset:', email);
                // Don't reveal that the user doesn't exist
                return res.json({ message: 'If your email is registered, you will receive a password reset link' });
            }

            console.log('User found for password reset:', { id: user.id, email: user.email });

            // Delete any existing reset tokens for this user
            await PasswordResetModel.deleteByUserId(user.id!);

            // Create new reset token
            const resetToken = await PasswordResetModel.create(user.id!);
            console.log('Reset token created:', { token: resetToken.token });

            // Send email with reset link
            const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken.token}`;
            
            // Configure email transporter
            const transporter = nodemailer.createTransport({
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                secure: config.SMTP_PORT === 465,
                auth: {
                    user: config.SMTP_USER,
                    pass: config.SMTP_PASS
                }
            });

            console.log('Sending password reset email to:', email);

            // Send email
            await transporter.sendMail({
                from: config.SMTP_USER,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <p>You requested a password reset.</p>
                    <p>Click this <a href="${resetLink}">link</a> to reset your password.</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });

            console.log('Password reset email sent successfully');

            res.json({ message: 'If your email is registered, you will receive a password reset link' });
        } catch (error) {
            console.error('Password reset request error details:', error);
            res.status(500).json({ message: 'Error processing password reset request' });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            console.log('Password reset attempt with token:', token);

            // Find valid reset token
            const resetToken = await PasswordResetModel.findByToken(token);
            if (!resetToken) {
                console.log('Invalid or expired reset token');
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            console.log('Reset token found:', { token: resetToken.token, user_id: resetToken.user_id });

            // Find user
            const user = await UserModel.findById(resetToken.user_id);
            if (!user) {
                console.log('User not found for reset token:', resetToken.user_id);
                return res.status(400).json({ message: 'User not found' });
            }

            console.log('User found for password reset:', { id: user.id, email: user.email });

            // Hash new password
            const password_hash = await UserModel.hashPassword(password);

            // Update user's password
            await pool.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [password_hash, user.id]
            );

            console.log('Password updated successfully for user:', user.id);

            // Delete used reset token
            await PasswordResetModel.deleteByToken(token);

            console.log('Reset token deleted');

            res.json({ message: 'Password has been reset successfully' });
        } catch (error) {
            console.error('Password reset error details:', error);
            res.status(500).json({ message: 'Error resetting password' });
        }
    }

    // Verify email endpoint
    static async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.params;
            console.log('Verifying email with token:', token);
            const user = await UserModel.verifyEmail(token);
            if (!user) {
                console.log('Invalid or expired verification token');
                return res.status(400).json({ message: 'Invalid or expired verification token' });
            }
            console.log('Email verified successfully for user:', user.email);
            res.json({ message: 'Email verified successfully' });
        } catch (error) {
            console.error('Error verifying email:', error);
            res.status(500).json({ message: 'Error verifying email' });
        }
    }

    // Resend verification email endpoint
    static async resendVerificationEmail(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.is_verified) {
                return res.status(400).json({ message: 'Email already verified' });
            }

            const newToken = await UserModel.resendVerificationEmail(email);
            if (!newToken) {
                return res.status(400).json({ message: 'Could not generate new verification token' });
            }

            // Configure email transporter
            const transporter = nodemailer.createTransport({
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                secure: config.SMTP_PORT === 465,
                auth: {
                    user: config.SMTP_USER,
                    pass: config.SMTP_PASS
                }
            });

            const verificationLink = `${config.FRONTEND_URL}/verify-email/${newToken}`;

            // Send verification email
            await transporter.sendMail({
                from: config.SMTP_USER,
                to: user.email,
                subject: 'Verify Your Email',
                html: `
                    <p>Please click this <a href="${verificationLink}">link</a> to verify your email address.</p>
                    <p>If you didn't request this verification email, please ignore it.</p>
                `
            });

            res.json({ message: 'Verification email sent successfully' });
        } catch (error) {
            console.error('Error resending verification email:', error);
            res.status(500).json({ message: 'Error resending verification email' });
        }
    }
} 