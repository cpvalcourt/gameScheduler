"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_request_1 = require("../../middleware/validate-request");
const express_validator_1 = require("express-validator");
jest.mock('express-validator');
const mockValidationResult = express_validator_1.validationResult;
describe('validateRequest middleware', () => {
    let req;
    let res;
    let next;
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
        (0, validate_request_1.validateRequest)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
    it('should return 400 with errors if there are validation errors', () => {
        const errorsArray = [{ msg: 'Invalid value', param: 'field', location: 'body' }];
        mockValidationResult.mockReturnValue({ isEmpty: () => false, array: () => errorsArray });
        (0, validate_request_1.validateRequest)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: errorsArray });
        expect(next).not.toHaveBeenCalled();
    });
});
