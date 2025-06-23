import { Request, Response } from 'express';
import { UserModel, User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { processAndSaveImage, deleteImageFile } from '../middleware/upload';

export class UserController {
  static async getCurrentUser(req: Request, res: Response) {
    // The user is already authenticated and available in req.user
    const user = req.user as User;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    // Fetch the full user from the database to ensure all fields are present
    const dbUser = await UserModel.findById(user.id);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        is_verified: dbUser.is_verified,
        role: dbUser.role,
        is_active: dbUser.is_active,
        profile_picture_url: dbUser.profile_picture_url,
        bio: dbUser.bio,
        location: dbUser.location,
        phone: dbUser.phone,
        date_of_birth: dbUser.date_of_birth,
        linkedin_url: dbUser.linkedin_url,
        twitter_url: dbUser.twitter_url,
        website_url: dbUser.website_url,
        created_at: dbUser.created_at
      }
    });
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const user = req.user as User;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const {
        username,
        email,
        bio,
        location,
        phone,
        date_of_birth,
        linkedin_url,
        twitter_url,
        website_url
      } = req.body;

      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required' });
      }

      // Validate email format if provided
      if (email && !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check for duplicate email if email is being changed
      if (email && email !== user.email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
      }

      // Validate phone format if provided (basic validation)
      if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Validate URLs if provided (more flexible - allow URLs without protocol)
      const urlFields = { linkedin_url, twitter_url, website_url };
      for (const [field, url] of Object.entries(urlFields)) {
        if (url && !UserController.isValidUrl(url) && !UserController.isValidUrl(`http://${url}`)) {
          return res.status(400).json({ message: `Invalid ${field.replace('_', ' ')} format` });
        }
      }

      // Update user profile - filter out undefined values
      const updateData: any = {};
      
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (phone !== undefined) updateData.phone = phone;
      if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
      if (twitter_url !== undefined) updateData.twitter_url = twitter_url;
      if (website_url !== undefined) updateData.website_url = website_url;

      // Handle date_of_birth properly (avoid timezone issues)
      if (date_of_birth !== undefined) {
        // Treat as local date string to avoid timezone conversion
        updateData.date_of_birth = date_of_birth;
      }

      const updatedUser = await UserModel.update(user.id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          is_verified: updatedUser.is_verified,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
          profile_picture_url: updatedUser.profile_picture_url,
          bio: updatedUser.bio,
          location: updatedUser.location,
          phone: updatedUser.phone,
          date_of_birth: updatedUser.date_of_birth,
          linkedin_url: updatedUser.linkedin_url,
          twitter_url: updatedUser.twitter_url,
          website_url: updatedUser.website_url,
          created_at: updatedUser.created_at
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Helper function to validate URLs (more flexible)
  private static isValidUrl(url: string): boolean {
    try {
      // If URL doesn't start with http:// or https://, try adding http://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const user = req.user as User;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      // Get current user with password
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password - we need to use a different approach since the update method doesn't allow password updates
      await pool.execute(
        'UPDATE USERS SET PASSWORD_HASH = ?, UPDATED_AT = NOW() WHERE ID = ?',
        [hashedNewPassword, user.id]
      );

      return res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUser(req: Request, res: Response) {
    const id = Number(req.params.id);
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  }

  static async updateUser(req: Request, res: Response) {
    const id = Number(req.params.id);
    const updates = req.body;
    const updated = await UserModel.update(id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(updated);
  }

  static async deleteUser(req: Request, res: Response) {
    const id = Number(req.params.id);
    const deleted = await UserModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  }

  static async uploadProfilePicture(req: Request, res: Response) {
    try {
      const user = req.user as User;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Get current user to check if they have an existing profile picture
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Process and save the new image
      const imagePath = await processAndSaveImage(
        req.file.buffer,
        req.file.originalname,
        300, // width
        300  // height
      );

      // Delete old profile picture if it exists
      if (currentUser.profile_picture_url) {
        await deleteImageFile(currentUser.profile_picture_url);
      }

      // Update user's profile picture URL
      const updatedUser = await UserModel.update(user.id, {
        profile_picture_url: imagePath
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'Profile picture uploaded successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          is_verified: updatedUser.is_verified,
          profile_picture_url: updatedUser.profile_picture_url,
          created_at: updatedUser.created_at
        }
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteProfilePicture(req: Request, res: Response) {
    try {
      const user = req.user as User;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get current user
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete the image file if it exists
      if (currentUser.profile_picture_url) {
        await deleteImageFile(currentUser.profile_picture_url);
      }

      // Update user to remove profile picture URL
      const updatedUser = await UserModel.update(user.id, {
        profile_picture_url: null
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'Profile picture deleted successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          is_verified: updatedUser.is_verified,
          profile_picture_url: updatedUser.profile_picture_url,
          created_at: updatedUser.created_at
        }
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const user = req.user as User;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: 'Password is required to delete account' });
      }

      // Verify user's password before deletion
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, currentUser.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Delete profile picture if it exists
      if (currentUser.profile_picture_url) {
        await deleteImageFile(currentUser.profile_picture_url);
      }

      // Delete the user account
      const deleted = await UserModel.delete(user.id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 