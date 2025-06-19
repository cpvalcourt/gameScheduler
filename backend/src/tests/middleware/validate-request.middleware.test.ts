import { validateRequest } from '../../middleware/validate-request';
import { validationResult } from 'express-validator';

jest.mock('express-validator');

const mockValidationResult = validationResult as unknown as jest.Mock;

describe('validateRequest middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if there are no validation errors', () => {
    mockValidationResult.mockReturnValue({ isEmpty: () => true });
    validateRequest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 with errors if there are validation errors', () => {
    const errorsArray = [{ msg: 'Invalid value', param: 'field', location: 'body' }];
    mockValidationResult.mockReturnValue({ isEmpty: () => false, array: () => errorsArray });
    validateRequest(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: errorsArray });
    expect(next).not.toHaveBeenCalled();
  });
}); 