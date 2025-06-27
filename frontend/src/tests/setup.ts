import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { I18nProvider } from "../contexts/I18nContext";
import React, { type ReactElement } from "react";

// Mock the API service
vi.mock('../services/api', () => {
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

// Suppress React Router future flag warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React Router Future Flag Warning') ||
     args[0].includes('v7_startTransition') ||
     args[0].includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

afterEach(() => {
  cleanup();
});

export function renderWithProviders(ui: ReactElement) {
  return render(
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>{ui}</AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
} 