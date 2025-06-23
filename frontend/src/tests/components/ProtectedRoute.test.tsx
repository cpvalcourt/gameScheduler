import { screen, render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import React, { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { I18nProvider } from "../../contexts/I18nContext";
import ProtectedRoute from "../../components/ProtectedRoute";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component to render inside ProtectedRoute
const TestComponent = () => <div>Protected Content</div>;

// Custom render function with providers
const renderWithProviders = (ui: any) => {
  return render(
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>{ui}</AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when token exists", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when no token exists", () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to login page
    expect(window.location.pathname).toBe("/login");
  });

  it("should redirect to login when token is empty", () => {
    localStorageMock.getItem.mockReturnValue("");

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to login page
    expect(window.location.pathname).toBe("/login");
  });

  it("should redirect to login when token is undefined", () => {
    localStorageMock.getItem.mockReturnValue(undefined);

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render multiple children when token exists", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    renderWithProviders(
      <ProtectedRoute>
        <div>Child 1</div>
        <div>Child 2</div>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should call localStorage.getItem with correct key", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith("token");
  });
});
