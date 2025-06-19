import { requireVerifiedEmail } from '../../middleware/require-verified-email';
import { UserModel } from '../../models/user.model';

jest.mock('../../models/user.model');
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('requireVerifiedEmail middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

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
    await requireVerifiedEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    mockUserModel.findById.mockResolvedValue(null);
    await requireVerifiedEmail(req, res, next);
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
    await requireVerifiedEmail(req, res, next);
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
    await requireVerifiedEmail(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 500 on error', async () => {
    mockUserModel.findById.mockRejectedValue(new Error('DB error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await requireVerifiedEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
}); 