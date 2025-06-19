import { Request, Response } from 'express';
import { GameSeriesController } from '../../controllers/game-series.controller';
import { GameSeriesModel } from '../../models/game-series.model';

jest.mock('../../models/game-series.model');

describe('GameSeriesController', () => {
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

  describe('createSeries', () => {
    const mockSeries = {
      id: 1,
      name: 'Test Series',
      description: 'Test Description',
      type: 'tournament',
      start_date: '2024-07-01',
      end_date: '2024-07-10',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    beforeEach(() => {
      mockRequest.body = {
        name: 'Test Series',
        description: 'Test Description',
        type: 'tournament',
        start_date: '2024-07-01',
        end_date: '2024-07-10',
      };
      mockRequest.user = { id: 1, email: 'test@example.com' };
    });

    it('should create a series successfully', async () => {
      (GameSeriesModel.create as jest.Mock).mockResolvedValue(mockSeries);

      await GameSeriesController.createSeries(mockRequest as Request, mockResponse as Response);

      expect(GameSeriesModel.create).toHaveBeenCalledWith({
        name: 'Test Series',
        description: 'Test Description',
        type: 'tournament',
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-07-10'),
        created_by: 1
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        message: 'Series created successfully',
        series: mockSeries
      });
    });

    it('should return 400 if name is missing', async () => {
      mockRequest.body = { description: 'Test Description', type: 'tournament', start_date: '2024-07-01', end_date: '2024-07-10' };

      await GameSeriesController.createSeries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message', 'Series name is required');
    });
  });

  describe('getSeries', () => {
    const mockSeries = {
      id: 1,
      name: 'Test Series',
      description: 'Test Description',
      type: 'tournament',
      start_date: '2024-07-01',
      end_date: '2024-07-10',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    beforeEach(() => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, email: 'test@example.com' };
    });

    it('should return series data if found', async () => {
      (GameSeriesModel.findById as jest.Mock).mockResolvedValue(mockSeries);

      await GameSeriesController.getSeries(mockRequest as Request, mockResponse as Response);

      expect(GameSeriesModel.findById).toHaveBeenCalledWith(1);
      expect(responseObject).toEqual(mockSeries);
    });

    it('should return 404 if series not found', async () => {
      (GameSeriesModel.findById as jest.Mock).mockResolvedValue(null);

      await GameSeriesController.getSeries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toHaveProperty('message', 'Series not found');
    });
  });

  describe('updateSeries', () => {
    const mockSeries = {
      id: 1,
      name: 'Updated Series',
      description: 'Updated Description',
      type: 'league',
      start_date: '2024-07-05',
      end_date: '2024-07-15',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    beforeEach(() => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Series',
        description: 'Updated Description',
        type: 'league',
        start_date: '2024-07-05',
        end_date: '2024-07-15',
      };
      mockRequest.user = { id: 1, email: 'test@example.com' };
    });

    it('should update series if user is owner', async () => {
      (GameSeriesModel.isOwner as jest.Mock).mockResolvedValue(true);
      (GameSeriesModel.update as jest.Mock).mockResolvedValue(mockSeries);

      await GameSeriesController.updateSeries(mockRequest as Request, mockResponse as Response);

      expect(GameSeriesModel.isOwner).toHaveBeenCalledWith(1, 1);
      expect(GameSeriesModel.update).toHaveBeenCalledWith(1, {
        name: 'Updated Series',
        description: 'Updated Description',
        type: 'league',
        start_date: '2024-07-05',
        end_date: '2024-07-15',
      });
      expect(responseObject).toEqual({
        message: 'Series updated successfully',
        series: mockSeries
      });
    });

    it('should return 403 if user is not owner', async () => {
      (GameSeriesModel.isOwner as jest.Mock).mockResolvedValue(false);

      await GameSeriesController.updateSeries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toHaveProperty('message', 'Only the series owner can update the series');
    });
  });

  describe('deleteSeries', () => {
    beforeEach(() => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, email: 'test@example.com' };
    });

    it('should delete series if user is owner', async () => {
      (GameSeriesModel.isOwner as jest.Mock).mockResolvedValue(true);
      (GameSeriesModel.delete as jest.Mock).mockResolvedValue(undefined);

      await GameSeriesController.deleteSeries(mockRequest as Request, mockResponse as Response);

      expect(GameSeriesModel.isOwner).toHaveBeenCalledWith(1, 1);
      expect(GameSeriesModel.delete).toHaveBeenCalledWith(1);
      expect(responseObject).toHaveProperty('message', 'Series deleted successfully');
    });

    it('should return 403 if user is not owner', async () => {
      (GameSeriesModel.isOwner as jest.Mock).mockResolvedValue(false);

      await GameSeriesController.deleteSeries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toHaveProperty('message', 'Only the series owner can delete the series');
    });
  });

  describe('getUserSeries', () => {
    const mockSeriesList = [
      {
        id: 1,
        name: 'Series 1',
        description: 'Desc 1',
        type: 'tournament',
        start_date: '2024-07-01',
        end_date: '2024-07-10',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Series 2',
        description: 'Desc 2',
        type: 'league',
        start_date: '2024-07-11',
        end_date: '2024-07-20',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    beforeEach(() => {
      mockRequest.user = { id: 1, email: 'test@example.com' };
    });

    it('should return user series', async () => {
      (GameSeriesModel.getUserSeries as jest.Mock).mockResolvedValue(mockSeriesList);

      await GameSeriesController.getUserSeries(mockRequest as Request, mockResponse as Response);

      expect(GameSeriesModel.getUserSeries).toHaveBeenCalledWith(1);
      expect(responseObject).toEqual(mockSeriesList);
    });
  });
}); 