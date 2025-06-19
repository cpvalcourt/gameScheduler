import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
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

// Wrapper component to provide router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when token exists", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when no token exists", () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // The component should redirect, so the protected content should not be visible
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to login when token is empty string", () => {
    localStorageMock.getItem.mockReturnValue("");

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to login when token is undefined", () => {
    localStorageMock.getItem.mockReturnValue(undefined);

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render multiple children when token exists", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should call localStorage.getItem with correct key", () => {
    localStorageMock.getItem.mockReturnValue("valid-token");

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith("token");
  });
});
