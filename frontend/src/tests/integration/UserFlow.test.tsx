import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../../App";
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

// Mock Material-UI components for simpler testing
vi.mock("@mui/material", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    TextField: ({ name, label, value, onChange, type, ...props }: any) => (
      <input
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        type={type}
        {...props}
      />
    ),
    Typography: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    Alert: ({ children, severity, ...props }: any) => (
      <div role="alert" {...props}>
        {children}
      </div>
    ),
    CircularProgress: ({ size, ...props }: any) => (
      <div {...props}>Loading...</div>
    ),
    Dialog: ({ children, open, onClose, ...props }: any) =>
      open ? <div {...props}>{children}</div> : null,
    DialogTitle: ({ children, ...props }: any) => (
      <h2 {...props}>{children}</h2>
    ),
    DialogContent: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    DialogActions: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    FormControlLabel: ({ control, label, ...props }: any) => (
      <label {...props}>
        {control}
        {label}
      </label>
    ),
    Checkbox: ({ name, checked, onChange, ...props }: any) => (
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        {...props}
      />
    ),
    Container: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  };
});

describe("User Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe("Authentication Flow", () => {
    it("should allow user to register and then login", async () => {
      const user = userEvent.setup();

      // Mock successful registration
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      render(<App />);

      // Navigate to registration
      const registerLink = screen.getByText(/register/i);
      await user.click(registerLink);

      // Fill registration form
      const nameInput = screen.getByPlaceholderText(/name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(nameInput, "Test User");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Submit registration
      const registerButton = screen.getByText(/register/i);
      await user.click(registerButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "user",
          expect.any(String)
        );
      });

      // Should be redirected to dashboard or home
      await waitFor(() => {
        expect(
          screen.getByText(/dashboard/i) || screen.getByText(/home/i)
        ).toBeInTheDocument();
      });

      // Logout
      const logoutButton = screen.getByText(/logout/i);
      await user.click(logoutButton);

      // Should be redirected to login
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      // Login with same credentials
      const loginEmailInput = screen.getByPlaceholderText(/email/i);
      const loginPasswordInput = screen.getByPlaceholderText(/password/i);

      await user.type(loginEmailInput, "test@example.com");
      await user.type(loginPasswordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Should be logged in again
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });
    });

    it("should handle authentication errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock failed login
      mockApi.post.mockRejectedValueOnce(new Error("Invalid credentials"));

      render(<App />);

      // Try to login with invalid credentials
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "invalid@example.com");
      await user.type(passwordInput, "wrongpassword");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Should still be on login page
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });

  describe("Protected Route Flow", () => {
    it("should redirect unauthenticated users to login", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Try to access a protected route
      const protectedLink =
        screen.getByText(/dashboard/i) || screen.getByText(/profile/i);
      await user.click(protectedLink);

      // Should be redirected to login
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it("should allow authenticated users to access protected routes", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Now try to access protected route
      const protectedLink =
        screen.getByText(/dashboard/i) || screen.getByText(/profile/i);
      await user.click(protectedLink);

      // Should be able to access the protected route
      await waitFor(() => {
        expect(
          screen.getByText(/dashboard/i) || screen.getByText(/profile/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Data Management Flow", () => {
    it("should allow authenticated users to manage their data", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock data retrieval
      mockApi.get.mockResolvedValueOnce({
        data: {
          teams: [{ id: 1, name: "Team A", description: "Test team" }],
        },
      });

      render(<App />);

      // Login
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to data management section
      const dataLink = screen.getByText(/teams/i) || screen.getByText(/data/i);
      await user.click(dataLink);

      // Should be able to see the data
      await waitFor(() => {
        expect(screen.getByText(/team a/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling Flow", () => {
    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock network error
      mockApi.post.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);

      // Try to login
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it("should handle 401 errors by logging out user", async () => {
      const user = userEvent.setup();

      // Set up authenticated state
      localStorageMock.getItem.mockReturnValue("test-token");
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({
          id: 1,
          email: "test@example.com",
          name: "Test User",
        })
      );

      // Mock 401 error
      mockApi.get.mockRejectedValueOnce({
        response: { status: 401 },
      });

      render(<App />);

      // Try to access protected data
      const dataLink = screen.getByText(/teams/i) || screen.getByText(/data/i);
      await user.click(dataLink);

      // Should be logged out and redirected to login
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Flow", () => {
    it("should allow users to navigate between different sections", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      render(<App />);

      // Login
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to different sections
      const sections = ["dashboard", "profile", "teams", "settings"];

      for (const section of sections) {
        const sectionLink = screen.getByText(new RegExp(section, "i"));
        if (sectionLink) {
          await user.click(sectionLink);

          // Should be on the correct page
          await waitFor(() => {
            expect(
              screen.getByText(new RegExp(section, "i"))
            ).toBeInTheDocument();
          });
        }
      }
    });
  });
});
