import dotenv from 'dotenv';
import path from 'path';
import { pool } from '../config/database';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  // Close all database connections
  await pool.end();
});

// Reset database between tests
beforeEach(async () => {
  // Clear any test data if needed
});

afterEach(async () => {
  // Clean up after each test
  jest.clearAllMocks();
}); 