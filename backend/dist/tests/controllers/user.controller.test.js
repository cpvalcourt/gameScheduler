"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../../controllers/user.controller");
const user_model_1 = require("../../models/user.model");
jest.mock('../../models/user.model');
jest.mock('jsonwebtoken');
describe('UserController', () => {
    let mockRequest;
    let mockResponse;
    let responseObject;
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
        jest.clearAllMocks();
    });
    describe('getUser', () => {
        it('should return user data if found', async () => {
            const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
            user_model_1.UserModel.findById.mockResolvedValue(mockUser);
            mockRequest.params = { id: '1' };
            await user_controller_1.UserController.getUser(mockRequest, mockResponse);
            expect(user_model_1.UserModel.findById).toHaveBeenCalledWith(1);
            expect(responseObject).toEqual(mockUser);
        });
        it('should return 404 if user not found', async () => {
            user_model_1.UserModel.findById.mockResolvedValue(null);
            mockRequest.params = { id: '2' };
            await user_controller_1.UserController.getUser(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'User not found');
        });
    });
    describe('updateUser', () => {
        it('should update user and return updated data', async () => {
            const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
            user_model_1.UserModel.update.mockResolvedValue(mockUser);
            mockRequest.params = { id: '1' };
            mockRequest.body = { username: 'updated' };
            await user_controller_1.UserController.updateUser(mockRequest, mockResponse);
            expect(user_model_1.UserModel.update).toHaveBeenCalledWith(1, { username: 'updated' });
            expect(responseObject).toEqual(mockUser);
        });
        it('should return 404 if user not found', async () => {
            user_model_1.UserModel.update.mockResolvedValue(null);
            mockRequest.params = { id: '2' };
            mockRequest.body = { username: 'updated' };
            await user_controller_1.UserController.updateUser(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'User not found');
        });
    });
    describe('deleteUser', () => {
        it('should delete user and return success', async () => {
            user_model_1.UserModel.delete.mockResolvedValue(true);
            mockRequest.params = { id: '1' };
            await user_controller_1.UserController.deleteUser(mockRequest, mockResponse);
            expect(user_model_1.UserModel.delete).toHaveBeenCalledWith(1);
            expect(responseObject).toHaveProperty('message', 'User deleted successfully');
        });
        it('should return 404 if user not found', async () => {
            user_model_1.UserModel.delete.mockResolvedValue(false);
            mockRequest.params = { id: '2' };
            await user_controller_1.UserController.deleteUser(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'User not found');
        });
    });
});
