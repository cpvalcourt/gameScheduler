import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user.model';

jest.mock('../../models/user.model');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate a valid token and set user in request', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };

      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'test@example.com' });
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verify).toHaveBeenCalledWith('test-token', process.env.JWT_SECRET);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(mockRequest.user).toEqual({
        id: 1,
        email: 'test@example.com'
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      mockRequest.headers = {};

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No token provided'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token expired'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'test@example.com' });
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'test@example.com' });
      (UserModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
}); 