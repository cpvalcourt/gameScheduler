import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { mockGet, mockPost, mockPut, mockDelete } from "../__mocks__/api";

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, error, login, logout, register } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? "Loading" : "Not Loading"}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : "No User"}</div>
      <div data-testid="error">{error || "No Error"}</div>
      <button onClick={() => login("test@example.com", "password")}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button
        onClick={() => register("test@example.com", "password", "testuser")}
      >
        Register
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset localStorage mock functions
    (localStorage.getItem as any).mockReturnValue(null);
    (localStorage.setItem as any).mockImplementation(() => {});
    (localStorage.removeItem as any).mockImplementation(() => {});
  });

  describe("AuthProvider", () => {
    it("should render children without crashing", () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with loading state when no token exists", () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
    });

    it("should validate stored token on mount", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
        role: "user" as const,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      };

      // Set up localStorage mock before rendering
      (localStorage.getItem as any).mockReturnValue("valid-token");
      mockGet.mockResolvedValue({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/users/me");
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });
    });

    it("should clear invalid token on mount", async () => {
      // Set up localStorage mock before rendering
      (localStorage.getItem as any).mockReturnValue("invalid-token");
      mockGet.mockRejectedValue(new Error("Invalid token"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/users/me");
        expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      });
    });
  });

  describe("useAuth hook", () => {
    it("should throw error when used outside AuthProvider", () => {
      const TestComponentOutside = () => {
        useAuth();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponentOutside />);
      }).toThrow("useAuth must be used within an AuthProvider");
    });
  });

  describe("login function", () => {
    it("should successfully login user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
        role: "user" as const,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue({
        data: { token: "new-token", user: mockUser },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByText("Login"));
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password",
        });
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });
    });

    it("should handle login errors", async () => {
      const errorMessage = "Invalid credentials";
      mockPost.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByText("Login"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      });
    });
  });

  describe("logout function", () => {
    it("should successfully logout user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
        role: "user" as const,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
      };

      // Set up localStorage mock before rendering
      (localStorage.getItem as any).mockReturnValue("valid-token");
      mockGet.mockResolvedValue({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByText("Logout"));
      });

      expect(screen.getByTestId("user")).toHaveTextContent("No User");
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("register function", () => {
    it("should successfully register user", async () => {
      mockPost.mockResolvedValue({ data: { message: "User registered" } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByText("Register"));
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/auth/register", {
          email: "test@example.com",
          password: "password",
          username: "testuser",
        });
      });
    });

    it("should handle registration errors", async () => {
      const errorMessage = "Email already exists";
      mockPost.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByText("Register"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      });
    });
  });
});
