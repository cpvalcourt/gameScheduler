"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../../models/user.model");
jest.mock('../../models/user.model');
jest.mock('jsonwebtoken');
describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
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
            jsonwebtoken_1.default.verify.mockReturnValue({ id: 1, email: 'test@example.com' });
            user_model_1.UserModel.findById.mockResolvedValue(mockUser);
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('test-token', process.env.JWT_SECRET);
            expect(user_model_1.UserModel.findById).toHaveBeenCalledWith(1);
            expect(mockRequest.user).toEqual({
                id: 1,
                email: 'test@example.com'
            });
            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
        it('should return 401 if no token is provided', async () => {
            mockRequest.headers = {};
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'No token provided'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should return 401 if token is invalid', async () => {
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new jsonwebtoken_1.default.JsonWebTokenError('Invalid token');
            });
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Invalid token'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should return 401 if token is expired', async () => {
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new jsonwebtoken_1.default.TokenExpiredError('Token expired', new Date());
            });
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token expired'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should return 401 if user is not found', async () => {
            jsonwebtoken_1.default.verify.mockReturnValue({ id: 1, email: 'test@example.com' });
            user_model_1.UserModel.findById.mockResolvedValue(null);
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'User not found'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should handle database errors gracefully', async () => {
            jsonwebtoken_1.default.verify.mockReturnValue({ id: 1, email: 'test@example.com' });
            user_model_1.UserModel.findById.mockRejectedValue(new Error('Database error'));
            await (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});
