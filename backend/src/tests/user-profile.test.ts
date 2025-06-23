import request from 'supertest';
import app from '../app';
import { UserModel } from '../models/user.model';
import jwt from 'jsonwebtoken';

describe('User Profile Management', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Create a test user with unique credentials
    const timestamp = Date.now();
    testUser = await UserModel.create(
      `testuser_${timestamp}`, 
      `test_${timestamp}@example.com`, 
      'password123'
    );
    
    // Verify the user for testing
    await UserModel.update(testUser.id, { is_verified: true });
    
    // Generate auth token with the correct secret and payload
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      'your_jwt_secret_key_change_this_in_production',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      await UserModel.delete(testUser.id);
    }
  });

  describe('GET /users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('is_verified');
      expect(response.body.user).toHaveProperty('role');
      expect(response.body.user).toHaveProperty('is_active');
      expect(response.body.user).toHaveProperty('created_at');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', async () => {
      const timestamp = Date.now();
      const updateData = {
        username: `updateduser_${timestamp}`,
        email: `updated_${timestamp}@example.com`
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.username).toBe(updateData.username);
      expect(response.body.user.email).toBe(updateData.email);
      expect(response.body.user).toHaveProperty('role');
      expect(response.body.user).toHaveProperty('is_active');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and email are required');
    });

    it('should return 400 for duplicate email', async () => {
      // Create another user first
      const timestamp = Date.now();
      const otherUser = await UserModel.create(
        `otheruser_${timestamp}`, 
        `other_${timestamp}@example.com`, 
        'password123'
      );
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'testuser',
          email: `other_${timestamp}@example.com` // This email is already taken
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is already taken');

      // Clean up
      await UserModel.delete(otherUser.id);
    });
  });

  describe('PUT /users/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should return 400 for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should return 400 for short new password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: '123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('New password must be at least 6 characters long');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentPassword: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password and new password are required');
    });
  });
}); 