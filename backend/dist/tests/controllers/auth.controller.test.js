"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("../../controllers/auth.controller");
const user_model_1 = require("../../models/user.model");
const password_reset_model_1 = require("../../models/password-reset.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../../config/env"));
// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../models/password-reset.model');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');
describe('AuthController', () => {
    let mockRequest;
    let mockResponse;
    let responseObject;
    let mockSendMail;
    beforeEach(() => {
        responseObject = {};
        mockRequest = {};
        mockResponse = {
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            }),
            status: jest.fn().mockImplementation((code) => {
                responseObject.statusCode = code;
                return mockResponse;
            }),
        };
        // Setup nodemailer mock
        mockSendMail = jest.fn().mockResolvedValue(true);
        nodemailer_1.default.createTransport.mockReturnValue({
            sendMail: mockSendMail,
        });
        // Reset all mocks before each test
        jest.clearAllMocks();
    });
    afterEach(() => {
        // Clean up any open handles
        jest.resetAllMocks();
    });
    afterAll(() => {
        // Clean up all mocks
        jest.restoreAllMocks();
    });
    describe('register', () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedpassword',
            verification_token: 'verification-token',
        };
        beforeEach(() => {
            mockRequest.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };
        });
        it('should register a new user successfully', async () => {
            // Mock UserModel methods
            user_model_1.UserModel.findByEmail.mockResolvedValue(null);
            user_model_1.UserModel.findByUsername.mockResolvedValue(null);
            user_model_1.UserModel.create.mockResolvedValue(mockUser);
            // Mock JWT sign
            jsonwebtoken_1.default.sign.mockReturnValue('mock-jwt-token');
            await auth_controller_1.AuthController.register(mockRequest, mockResponse);
            expect(user_model_1.UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(user_model_1.UserModel.findByUsername).toHaveBeenCalledWith('testuser');
            expect(user_model_1.UserModel.create).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' }, env_1.default.JWT_SECRET, { expiresIn: '24h' });
            expect(mockSendMail).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.');
            expect(responseObject).toHaveProperty('token', 'mock-jwt-token');
            expect(responseObject.user).not.toHaveProperty('password');
        });
        it('should return 400 if email already exists', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(mockUser);
            await auth_controller_1.AuthController.register(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'User already exists with this email');
        });
        it('should return 400 if username is taken', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(null);
            user_model_1.UserModel.findByUsername.mockResolvedValue(mockUser);
            await auth_controller_1.AuthController.register(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Username is already taken');
        });
    });
    describe('login', () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedpassword',
        };
        beforeEach(() => {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
            };
        });
        it('should login user successfully', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(mockUser);
            user_model_1.UserModel.verifyPassword.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('mock-jwt-token');
            await auth_controller_1.AuthController.login(mockRequest, mockResponse);
            expect(user_model_1.UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(user_model_1.UserModel.verifyPassword).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' }, env_1.default.JWT_SECRET, { expiresIn: '24h' });
            expect(responseObject).toHaveProperty('message', 'Login successful');
            expect(responseObject).toHaveProperty('token', 'mock-jwt-token');
            expect(responseObject.user).not.toHaveProperty('password');
        });
        it('should return 401 if user not found', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(null);
            await auth_controller_1.AuthController.login(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject).toHaveProperty('message', 'Invalid credentials');
        });
        it('should return 401 if password is invalid', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(mockUser);
            user_model_1.UserModel.verifyPassword.mockResolvedValue(false);
            await auth_controller_1.AuthController.login(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject).toHaveProperty('message', 'Invalid credentials');
        });
    });
    describe('requestPasswordReset', () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
        };
        beforeEach(() => {
            mockRequest.body = {
                email: 'test@example.com',
            };
        });
        it('should send password reset email if user exists', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(mockUser);
            password_reset_model_1.PasswordResetModel.deleteByUserId.mockResolvedValue(true);
            password_reset_model_1.PasswordResetModel.create.mockResolvedValue({ token: 'reset-token' });
            await auth_controller_1.AuthController.requestPasswordReset(mockRequest, mockResponse);
            expect(user_model_1.UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(password_reset_model_1.PasswordResetModel.deleteByUserId).toHaveBeenCalledWith(1);
            expect(password_reset_model_1.PasswordResetModel.create).toHaveBeenCalledWith(1);
            expect(mockSendMail).toHaveBeenCalled();
            expect(responseObject).toHaveProperty('message', 'If your email is registered, you will receive a password reset link');
        });
        it('should return success message even if user does not exist', async () => {
            user_model_1.UserModel.findByEmail.mockResolvedValue(null);
            await auth_controller_1.AuthController.requestPasswordReset(mockRequest, mockResponse);
            expect(responseObject).toHaveProperty('message', 'If your email is registered, you will receive a password reset link');
        });
    });
    describe('resetPassword', () => {
        const mockResetToken = {
            token: 'reset-token',
            user_id: 1,
        };
        const mockUser = {
            id: 1,
            email: 'test@example.com',
        };
        beforeEach(() => {
            mockRequest.body = {
                token: 'reset-token',
                password: 'newpassword123',
            };
        });
        it('should reset password successfully', async () => {
            password_reset_model_1.PasswordResetModel.findByToken.mockResolvedValue(mockResetToken);
            user_model_1.UserModel.findById.mockResolvedValue(mockUser);
            user_model_1.UserModel.hashPassword.mockResolvedValue('hashed-new-password');
            password_reset_model_1.PasswordResetModel.deleteByToken.mockResolvedValue(true);
            await auth_controller_1.AuthController.resetPassword(mockRequest, mockResponse);
            expect(password_reset_model_1.PasswordResetModel.findByToken).toHaveBeenCalledWith('reset-token');
            expect(user_model_1.UserModel.findById).toHaveBeenCalledWith(1);
            expect(user_model_1.UserModel.hashPassword).toHaveBeenCalledWith('newpassword123');
            expect(password_reset_model_1.PasswordResetModel.deleteByToken).toHaveBeenCalledWith('reset-token');
            expect(responseObject).toHaveProperty('message', 'Password has been reset successfully');
        });
        it('should return 400 if reset token is invalid', async () => {
            password_reset_model_1.PasswordResetModel.findByToken.mockResolvedValue(null);
            await auth_controller_1.AuthController.resetPassword(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Invalid or expired reset token');
        });
        it('should return 400 if user not found', async () => {
            password_reset_model_1.PasswordResetModel.findByToken.mockResolvedValue(mockResetToken);
            user_model_1.UserModel.findById.mockResolvedValue(null);
            await auth_controller_1.AuthController.resetPassword(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'User not found');
        });
    });
    describe('verifyEmail', () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
        };
        beforeEach(() => {
            mockRequest.params = {
                token: 'verification-token',
            };
        });
        it('should verify email successfully', async () => {
            user_model_1.UserModel.verifyEmail.mockResolvedValue(mockUser);
            await auth_controller_1.AuthController.verifyEmail(mockRequest, mockResponse);
            expect(user_model_1.UserModel.verifyEmail).toHaveBeenCalledWith('verification-token');
            expect(responseObject).toHaveProperty('message', 'Email verified successfully');
        });
        it('should return 400 if verification token is invalid', async () => {
            user_model_1.UserModel.verifyEmail.mockResolvedValue(null);
            await auth_controller_1.AuthController.verifyEmail(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Invalid or expired verification token');
        });
    });
});
