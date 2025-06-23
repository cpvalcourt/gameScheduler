"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_verified_email_1 = require("../../middleware/require-verified-email");
const user_model_1 = require("../../models/user.model");
jest.mock('../../models/user.model');
const mockUserModel = user_model_1.UserModel;
describe('requireVerifiedEmail middleware', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = { user: { id: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });
    it('should return 401 if user is not authenticated', async () => {
        req.user = undefined;
        await (0, require_verified_email_1.requireVerifiedEmail)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
    });
    it('should return 401 if user is not found', async () => {
        mockUserModel.findById.mockResolvedValue(null);
        await (0, require_verified_email_1.requireVerifiedEmail)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(next).not.toHaveBeenCalled();
    });
    it('should return 403 if user is not verified', async () => {
        mockUserModel.findById.mockResolvedValue({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashed',
            is_verified: false,
            role: 'user',
            is_active: false,
            admin_notes: null,
            verification_token: null,
            profile_picture_url: null,
            bio: null,
            location: null,
            phone: null,
            date_of_birth: null,
            linkedin_url: null,
            twitter_url: null,
            website_url: null,
            created_at: new Date(),
            updated_at: new Date()
        });
        await (0, require_verified_email_1.requireVerifiedEmail)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email verification required', isVerified: false });
        expect(next).not.toHaveBeenCalled();
    });
    it('should call next if user is verified', async () => {
        mockUserModel.findById.mockResolvedValue({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashed',
            is_verified: true,
            role: 'user',
            is_active: false,
            admin_notes: null,
            verification_token: null,
            profile_picture_url: null,
            bio: null,
            location: null,
            phone: null,
            date_of_birth: null,
            linkedin_url: null,
            twitter_url: null,
            website_url: null,
            created_at: new Date(),
            updated_at: new Date()
        });
        await (0, require_verified_email_1.requireVerifiedEmail)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
    it('should return 500 on error', async () => {
        mockUserModel.findById.mockRejectedValue(new Error('DB error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        await (0, require_verified_email_1.requireVerifiedEmail)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
