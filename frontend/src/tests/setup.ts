import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { I18nProvider } from "../contexts/I18nContext";
import React, { type ReactElement } from "react";

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