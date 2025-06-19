import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requireVerifiedEmail } from '../middleware/require-verified-email';
import { upload } from '../middleware/upload';

const router = express.Router();

// All user routes require authentication and verified email
router.use(authenticate);
router.use(requireVerifiedEmail);

// Get current user profile
router.get('/me', UserController.getCurrentUser);

// Update user profile
router.put('/profile', UserController.updateProfile);

// Change password
router.put('/change-password', UserController.changePassword);

// Upload profile picture
router.post('/profile-picture', upload.single('image'), UserController.uploadProfilePicture);

// Delete profile picture
router.delete('/profile-picture', UserController.deleteProfilePicture);

// Delete account
router.delete('/account', UserController.deleteAccount);

export default router; 