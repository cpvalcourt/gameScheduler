import { screen, render, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import React, { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { I18nProvider } from "../../contexts/I18nContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { mockGet } from "../__mocks__/api";

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

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  is_verified: true,
  role: "user",
  is_active: true,
  created_at: "2023-01-01T00:00:00Z",
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/users/me") {
        return Promise.resolve({ data: { user: mockUser } });
      }
      return Promise.resolve({});
    });
  });

  it("should render children when token exists", async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return "valid-token";
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() =>
      expect(
        screen.queryByLabelText("Loading authentication")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when no token exists", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return null;
      if (key === "user") return null;
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to login page
    expect(window.location.pathname).toBe("/login");
  });

  it("should redirect to login when token is empty", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return "";
      if (key === "user") return null;
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to login page
    expect(window.location.pathname).toBe("/login");
  });

  it("should redirect to login when token is undefined", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return undefined;
      if (key === "user") return null;
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render multiple children when token exists", async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return "valid-token";
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Child 1</div>
        <div>Child 2</div>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() =>
      expect(
        screen.queryByLabelText("Loading authentication")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should call localStorage.getItem with correct key", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "token") return "valid-token";
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith("token");
  });
});
