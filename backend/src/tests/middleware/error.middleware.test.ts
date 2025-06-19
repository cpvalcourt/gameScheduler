import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/error';
import { AppError } from '../../utils/app-error';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError with status code and message', () => {
      const error = new AppError('Test error', 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Test error'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle AppError with default status code', () => {
      const error = new AppError('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Test error'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      (error as any).name = 'ValidationError';
      (error as any).errors = [{ message: 'Invalid field' }];

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [{ message: 'Invalid field' }]
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle JWT errors', () => {
      const error = new Error('Invalid token');
      (error as any).name = 'JsonWebTokenError';

      errorHandler(
        error,
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

    it('should handle JWT expired errors', () => {
      const error = new Error('Token expired');
      (error as any).name = 'TokenExpiredError';

      errorHandler(
        error,
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

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      errorHandler(
        error,
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