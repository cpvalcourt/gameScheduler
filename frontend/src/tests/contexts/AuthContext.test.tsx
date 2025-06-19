import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

// Mock the API service
vi.mock("../../services/api");
const mockApi = api as any;

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
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
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

    it("should initialize with loading state when no token exists", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
      });
    });

    it("should validate stored token on mount", async () => {
      const mockToken = "valid-token";
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
      };

      localStorageMock.getItem.mockReturnValue(mockToken);
      mockApi.get.mockResolvedValue({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith("/users/me");
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });
    });

    it("should clear invalid token on mount", async () => {
      const mockToken = "invalid-token";
      localStorageMock.getItem.mockReturnValue(mockToken);
      mockApi.get.mockRejectedValue(new Error("Invalid token"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
        expect(screen.getByTestId("user")).toHaveTextContent("No User");
      });
    });
  });

  describe("useAuth hook", () => {
    it("should throw error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });

    it("should provide auth context when used within AuthProvider", () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.getByTestId("user")).toBeInTheDocument();
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  describe("login function", () => {
    it("should successfully login user", async () => {
      const mockToken = "new-token";
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
      };

      mockApi.post.mockResolvedValue({
        data: { token: mockToken, user: mockUser },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const loginButton = screen.getByText("Login");

      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password",
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          mockToken
        );
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });
    });

    it("should handle login errors", async () => {
      const errorMessage = "Invalid credentials";
      mockApi.post.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const loginButton = screen.getByText("Login");

      await act(async () => {
        try {
          await user.click(loginButton);
        } catch (error) {
          // Expected error, ignore
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      });
    });
  });

  describe("logout function", () => {
    it("should successfully logout user", async () => {
      // First login to set up a user
      const mockToken = "new-token";
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_verified: true,
      };

      mockApi.post.mockResolvedValue({
        data: { token: mockToken, user: mockUser },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();

      // Login first
      const loginButton = screen.getByText("Login");
      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      // Then logout
      const logoutButton = screen.getByText("Logout");
      await act(async () => {
        await user.click(logoutButton);
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
        expect(screen.getByTestId("user")).toHaveTextContent("No User");
      });
    });
  });

  describe("register function", () => {
    it("should successfully register user", async () => {
      mockApi.post.mockResolvedValue({
        data: { message: "Registration successful" },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const registerButton = screen.getByText("Register");

      await act(async () => {
        await user.click(registerButton);
      });

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/register", {
          email: "test@example.com",
          password: "password",
          username: "testuser",
        });
        expect(screen.getByTestId("error")).toHaveTextContent("No Error");
      });
    });

    it("should handle registration errors", async () => {
      const errorMessage = "Email already exists";
      mockApi.post.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const registerButton = screen.getByText("Register");

      await act(async () => {
        try {
          await user.click(registerButton);
        } catch (error) {
          // Expected error, ignore
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      });
    });
  });
});
