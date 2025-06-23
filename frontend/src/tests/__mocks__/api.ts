import { vi } from "vitest";

// Create mock functions that can be controlled in tests
export const mockGet = vi.fn();
export const mockPost = vi.fn();
export const mockPut = vi.fn();
export const mockDelete = vi.fn();

// Mock the default export (the Axios instance)
const mockApi = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  // Add any other Axios instance methods that might be used
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  },
  defaults: {
    headers: {
      common: {}
    }
  }
};

// Mock the named exports
export const uploadProfilePicture = vi.fn();
export const deleteProfilePicture = vi.fn();
export const updateProfile = vi.fn();
export const deleteAccount = vi.fn();

// Export the mock API as default
export default mockApi; 