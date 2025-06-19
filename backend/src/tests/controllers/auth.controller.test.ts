import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { UserModel } from '../../models/user.model';
import { PasswordResetModel } from '../../models/password-reset.model';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from '../../config/env';

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../models/password-reset.model');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  let mockSendMail: jest.Mock;

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
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
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
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await AuthController.register(mockRequest as Request, mockResponse as Response);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
      expect(UserModel.create).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com' },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.');
      expect(responseObject).toHaveProperty('token', 'mock-jwt-token');
      expect(responseObject.user).not.toHaveProperty('password');
    });

    it('should return 400 if email already exists', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await AuthController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message', 'User already exists with this email');
    });

    it('should return 400 if username is taken', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(mockUser);

      await AuthController.register(mockRequest as Request, mockResponse as Response);

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
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await AuthController.login(mockRequest as Request, mockResponse as Response);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(UserModel.verifyPassword).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com' },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(responseObject).toHaveProperty('message', 'Login successful');
      expect(responseObject).toHaveProperty('token', 'mock-jwt-token');
      expect(responseObject.user).not.toHaveProperty('password');
    });

    it('should return 401 if user not found', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await AuthController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 if password is invalid', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(false);

      await AuthController.login(mockRequest as Request, mockResponse as Response);

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
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (PasswordResetModel.deleteByUserId as jest.Mock).mockResolvedValue(true);
      (PasswordResetModel.create as jest.Mock).mockResolvedValue({ token: 'reset-token' });

      await AuthController.requestPasswordReset(mockRequest as Request, mockResponse as Response);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(PasswordResetModel.deleteByUserId).toHaveBeenCalledWith(1);
      expect(PasswordResetModel.create).toHaveBeenCalledWith(1);
      expect(mockSendMail).toHaveBeenCalled();
      expect(responseObject).toHaveProperty('message', 'If your email is registered, you will receive a password reset link');
    });

    it('should return success message even if user does not exist', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await AuthController.requestPasswordReset(mockRequest as Request, mockResponse as Response);

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
      (PasswordResetModel.findByToken as jest.Mock).mockResolvedValue(mockResetToken);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.hashPassword as jest.Mock).mockResolvedValue('hashed-new-password');
      (PasswordResetModel.deleteByToken as jest.Mock).mockResolvedValue(true);

      await AuthController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(PasswordResetModel.findByToken).toHaveBeenCalledWith('reset-token');
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(UserModel.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(PasswordResetModel.deleteByToken).toHaveBeenCalledWith('reset-token');
      expect(responseObject).toHaveProperty('message', 'Password has been reset successfully');
    });

    it('should return 400 if reset token is invalid', async () => {
      (PasswordResetModel.findByToken as jest.Mock).mockResolvedValue(null);

      await AuthController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message', 'Invalid or expired reset token');
    });

    it('should return 400 if user not found', async () => {
      (PasswordResetModel.findByToken as jest.Mock).mockResolvedValue(mockResetToken);
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await AuthController.resetPassword(mockRequest as Request, mockResponse as Response);

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
      (UserModel.verifyEmail as jest.Mock).mockResolvedValue(mockUser);

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(UserModel.verifyEmail).toHaveBeenCalledWith('verification-token');
      expect(responseObject).toHaveProperty('message', 'Email verified successfully');
    });

    it('should return 400 if verification token is invalid', async () => {
      (UserModel.verifyEmail as jest.Mock).mockResolvedValue(null);

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message', 'Invalid or expired verification token');
    });
  });
}); 