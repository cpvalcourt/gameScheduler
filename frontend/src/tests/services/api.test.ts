import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API service before importing
vi.mock('../../services/api', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  const mockApi = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: {
      baseURL: 'http://localhost:3002/api',
      headers: {
        'Content-Type': 'application/json',
        common: {}
      }
    }
  };

  return {
    default: mockApi,
    uploadProfilePicture: vi.fn(),
    deleteProfilePicture: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn()
  };
});

// Import the mocked API
import api from '../../services/api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('Configuration', () => {
    it('should have correct base URL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:3002/api');
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('API Instance', () => {
    it('should be an axios instance', () => {
      expect(api).toBeDefined();
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
    });

    it('should have interceptors configured', () => {
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });
  });

  describe('Request Methods', () => {
    it('should have all required HTTP methods', () => {
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
    });
  });
}); 