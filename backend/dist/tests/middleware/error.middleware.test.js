"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../middleware/error");
const app_error_1 = require("../../utils/app-error");
describe('Error Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
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
            const error = new app_error_1.AppError('Test error', 400);
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Test error'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle AppError with default status code', () => {
            const error = new app_error_1.AppError('Test error');
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Test error'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle validation errors', () => {
            const error = new Error('Validation failed');
            error.name = 'ValidationError';
            error.errors = [{ message: 'Invalid field' }];
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: [{ message: 'Invalid field' }]
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle JWT errors', () => {
            const error = new Error('Invalid token');
            error.name = 'JsonWebTokenError';
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Invalid token'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle JWT expired errors', () => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token expired'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle unknown errors', () => {
            const error = new Error('Unknown error');
            (0, error_1.errorHandler)(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});
