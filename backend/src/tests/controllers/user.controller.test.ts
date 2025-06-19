import { Request, Response } from 'express';
import { UserController } from '../../controllers/user.controller';
import { UserModel } from '../../models/user.model';
import jwt from 'jsonwebtoken';
import config from '../../config/env';

jest.mock('../../models/user.model');
jest.mock('jsonwebtoken');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

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
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      mockRequest.params = { id: '1' };
      await UserController.getUser(mockRequest as Request, mockResponse as Response);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(responseObject).toEqual(mockUser);
    });
    it('should return 404 if user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { id: '2' };
      await UserController.getUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toHaveProperty('message', 'User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
      (UserModel.update as jest.Mock).mockResolvedValue(mockUser);
      mockRequest.params = { id: '1' };
      mockRequest.body = { username: 'updated' };
      await UserController.updateUser(mockRequest as Request, mockResponse as Response);
      expect(UserModel.update).toHaveBeenCalledWith(1, { username: 'updated' });
      expect(responseObject).toEqual(mockUser);
    });
    it('should return 404 if user not found', async () => {
      (UserModel.update as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { id: '2' };
      mockRequest.body = { username: 'updated' };
      await UserController.updateUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toHaveProperty('message', 'User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return success', async () => {
      (UserModel.delete as jest.Mock).mockResolvedValue(true);
      mockRequest.params = { id: '1' };
      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);
      expect(UserModel.delete).toHaveBeenCalledWith(1);
      expect(responseObject).toHaveProperty('message', 'User deleted successfully');
    });
    it('should return 404 if user not found', async () => {
      (UserModel.delete as jest.Mock).mockResolvedValue(false);
      mockRequest.params = { id: '2' };
      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toHaveProperty('message', 'User not found');
    });
  });
}); 